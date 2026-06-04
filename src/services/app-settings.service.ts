import { CurrencyCode } from "../constants/enums";
import { appSettingsRepository, type UpdateAppSettingsData } from "../repositories/app-settings.repository";
import type { AppSettingsEntity } from "../types/entity.types";
import { AppError } from "../utils/app-error";

class AppSettingsService {
  async get(): Promise<AppSettingsEntity> {
    const settings = await appSettingsRepository.getSingleton();
    if (!settings) {
      return appSettingsRepository.createDefault("3000", CurrencyCode.CDF);
    }
    return settings;
  }

  async update(dto: UpdateAppSettingsData): Promise<AppSettingsEntity> {
    const current = await this.get();
    const updated = await appSettingsRepository.update(current.id, dto);
    if (!updated) throw new AppError("Settings not found.", 404, "SETTINGS_NOT_FOUND");
    return updated;
  }
}

export const appSettingsService = new AppSettingsService();
