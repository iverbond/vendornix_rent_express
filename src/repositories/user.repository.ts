import { UserModel } from "../database";
import { UserStatus } from "../constants/enums";
import type { UserEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  password: string;
  status?: UserStatus;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  status?: UserStatus;
  password?: string;
}

class UserRepository {
  async findAll(): Promise<UserEntity[]> {
    const rows = await UserModel.findAll({
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
    });
    return rows.map((r) => toPublicJson<UserEntity>(r));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await UserModel.findByPk(id, { attributes: { exclude: ["password"] } });
    return row ? toPublicJson<UserEntity>(row) : null;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return UserModel.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const row = await UserModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      password: data.password,
      status: data.status ?? UserStatus.ACTIVE,
    });
    return toPublicJson<UserEntity>(row);
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity | null> {
    const row = await UserModel.findByPk(id);
    if (!row) return null;
    await row.update(data);
    return toPublicJson<UserEntity>(row);
  }

  async delete(id: string): Promise<boolean> {
    const row = await UserModel.findByPk(id);
    if (!row) return false;
    await row.destroy();
    return true;
  }
}

export const userRepository = new UserRepository();
