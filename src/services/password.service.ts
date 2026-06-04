import bcrypt from "bcryptjs";

class PasswordService {
  async hashPassword(password: string, rounds = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  async comparePassword(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
  }
}

export const passwordService = new PasswordService();
