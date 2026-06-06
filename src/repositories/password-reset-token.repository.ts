import { Op } from "sequelize";
import { PasswordResetTokenModel } from "../database/models/password-reset-token.model";

export interface CreatePasswordResetTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

class PasswordResetTokenRepository {
  async invalidateActiveForUser(userId: string): Promise<void> {
    await PasswordResetTokenModel.update(
      { usedAt: new Date() },
      { where: { userId, usedAt: null, expiresAt: { [Op.gt]: new Date() } } },
    );
  }

  async create(data: CreatePasswordResetTokenData): Promise<PasswordResetTokenModel> {
    return PasswordResetTokenModel.create(data);
  }

  async findValidByHash(tokenHash: string): Promise<PasswordResetTokenModel | null> {
    return PasswordResetTokenModel.findOne({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await PasswordResetTokenModel.update({ usedAt: new Date() }, { where: { id } });
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
