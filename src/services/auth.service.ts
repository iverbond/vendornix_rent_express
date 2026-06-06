import { env } from "../config/env";
import { UserStatus } from "../constants/enums";
import { passwordResetTokenRepository } from "../repositories/password-reset-token.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { AppError } from "../utils/app-error";
import { generateSecureToken, hashToken } from "../utils/token-hash.util";

const GENERIC_RESET_MESSAGE =
  "Si un compte existe pour cet e-mail, un lien de réinitialisation vient d'être envoyé.";

class AuthService {
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user || user.status !== UserStatus.ACTIVE) {
      return { message: GENERIC_RESET_MESSAGE };
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

    await passwordResetTokenRepository.invalidateActiveForUser(user.id);
    await passwordResetTokenRepository.create({ userId: user.id, tokenHash, expiresAt });

    const resetUrl = `${env.FRONTEND_URL.replace(/\/$/, "")}/auth/reset-password?token=${rawToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl, user.firstName);

    return { message: GENERIC_RESET_MESSAGE };
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
