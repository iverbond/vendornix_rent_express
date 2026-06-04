import { userRepository, type CreateUserData, type UpdateUserData } from "../repositories/user.repository";
import { passwordService } from "./password.service";
import type { UserEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class UserService {
  async getAll(): Promise<UserEntity[]> {
    return userRepository.findAll();
  }

  async getById(id: string): Promise<UserEntity> {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    return user;
  }

  async create(dto: Omit<CreateUserData, "password"> & { password: string }): Promise<UserEntity> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) throw new AppError("Email already in use.", 409, "EMAIL_EXISTS");

    const hashed = await passwordService.hashPassword(dto.password);
    return userRepository.create({ ...dto, password: hashed });
  }

  async update(id: string, dto: UpdateUserData): Promise<UserEntity> {
    const payload: UpdateUserData = { ...dto };
    if (dto.password) {
      payload.password = await passwordService.hashPassword(dto.password);
    }

    const user = await userRepository.update(id, payload);
    if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    return user;
  }

  async delete(id: string): Promise<void> {
    const deleted = await userRepository.delete(id);
    if (!deleted) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }
}

export const userService = new UserService();
