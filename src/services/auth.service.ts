import { env } from "../config/env";
import { MembershipRole, OrganizationStatus, OrganizationType, UserRole, UserStatus } from "../constants/enums";
import { membershipRepository } from "../repositories/membership.repository";
import { organizationRepository } from "../repositories/organization.repository";
import { passwordResetTokenRepository } from "../repositories/password-reset-token.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { AppError } from "../utils/app-error";
import { generateSecureToken, hashToken } from "../utils/token-hash.util";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import { toPublicJson } from "../utils/entity-mapper.util";
import type { UserEntity } from "../types/entity.types";

const GENERIC_RESET_MESSAGE =
  "Si un compte existe pour cet e-mail, un lien de réinitialisation vient d'être envoyé.";

const GENERIC_LOGIN_ERROR = "Email ou mot de passe incorrect.";

export interface AuthSession {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  password: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AppError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
    }

    const valid = await passwordService.comparePassword(password, user.password);
    if (!valid) {
      throw new AppError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
    }

    return {
      user: toPublicJson<UserEntity>(user),
      accessToken: signAccessToken(user.id, user.role),
      refreshToken: signRefreshToken(user.id),
    };
  }

  async register(dto: RegisterDto): Promise<AuthSession> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError("Email already in use.", 409, "EMAIL_EXISTS");
    }

    // The very first account on a fresh install becomes platform SUPER_ADMIN; everyone after is a plain USER.
    const isFirstAccount = (await userRepository.count()) === 0;

    const hashed = await passwordService.hashPassword(dto.password);
    const user = await userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: normalizedEmail,
      phone: dto.phone ?? null,
      password: hashed,
      status: UserStatus.ACTIVE,
      role: isFirstAccount ? UserRole.SUPER_ADMIN : UserRole.USER,
    });

    const organization = await organizationRepository.create({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      type: OrganizationType.INDIVIDUAL,
      status: OrganizationStatus.ACTIVE,
    });
    await membershipRepository.create({
      userId: user.id,
      organizationId: organization.id,
      role: MembershipRole.OWNER,
    });

    return {
      user,
      accessToken: signAccessToken(user.id, user.role),
      refreshToken: signRefreshToken(user.id),
    };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let userId: string;
    try {
      userId = verifyRefreshToken(token).sub;
    } catch {
      throw new AppError("Invalid or expired refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }

    const user = await userRepository.findById(userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AppError("Invalid or expired refresh token.", 401, "INVALID_REFRESH_TOKEN");
    }

    return {
      accessToken: signAccessToken(user.id, user.role),
      refreshToken: signRefreshToken(user.id),
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user || user.status !== UserStatus.ACTIVE) {
      return { message: GENERIC_RESET_MESSAGE };
    }

    const resetUrl = await this.issueResetLink(user.id);
    await emailService.sendPasswordResetEmail(user.email, resetUrl, user.firstName);

    return { message: GENERIC_RESET_MESSAGE };
  }

  /** Admin-triggered reset: same token mechanism as `requestPasswordReset`, but keyed by user id and returning the link so the admin can copy it. */
  async adminResetPassword(userId: string): Promise<{ resetUrl: string }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Utilisateur introuvable.", 404, "USER_NOT_FOUND");
    }

    const resetUrl = await this.issueResetLink(user.id);
    // Best-effort — the admin already gets the link back regardless of email delivery.
    await emailService.sendPasswordResetEmail(user.email, resetUrl, user.firstName).catch(() => undefined);

    return { resetUrl };
  }

  private async issueResetLink(userId: string): Promise<string> {
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

    await passwordResetTokenRepository.invalidateActiveForUser(userId);
    await passwordResetTokenRepository.create({ userId, tokenHash, expiresAt });

    return `${env.FRONTEND_URL.replace(/\/$/, "")}/auth/reset-password?token=${rawToken}`;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const tokenHash = hashToken(token.trim());
    const record = await passwordResetTokenRepository.findValidByHash(tokenHash);

    if (!record) {
      throw new AppError("Lien invalide ou expiré.", 400, "INVALID_RESET_TOKEN");
    }

    const hashed = await passwordService.hashPassword(password);
    const updated = await userRepository.updatePassword(record.userId, hashed);
    if (!updated) {
      throw new AppError("Utilisateur introuvable.", 404, "USER_NOT_FOUND");
    }

    await passwordResetTokenRepository.markUsed(record.id);
    await passwordResetTokenRepository.invalidateActiveForUser(record.userId);

    return { message: "Mot de passe mis à jour. Vous pouvez vous connecter." };
  }
}

export const authService = new AuthService();
