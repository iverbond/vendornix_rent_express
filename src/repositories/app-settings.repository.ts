import { AppSettingsModel } from "../database";
import { CurrencyCode } from "../constants/enums";
import type { AppSettingsEntity } from "../types/entity.types";
import { toPublicJson } from "../utils/entity-mapper.util";

export interface UpdateAppSettingsData {
  exchangeRate?: string;
  defaultCurrency?: CurrencyCode;
}

class AppSettingsRepository {
  async getSingleton(): Promise<AppSettingsEntity | null> {
    const row = await AppSettingsModel.findOne({ order: [["createdAt", "ASC"]] });
    return row ? toPublicJson<AppSettingsEntity>(row) : null;
  }

  async createDefault(exchangeRate: string, defaultCurrency: CurrencyCode): Promise<AppSettingsEntity> {
    const row = await AppSettingsModel.create({ exchangeRate, defaultCurrency });
    return toPublicJson<AppSettingsEntity>(row);
  }

  async update(id: string, data: UpdateAppSettingsData): Promise<AppSettingsEntity | null> {
    const row = await AppSettingsModel.findByPk(id);
    if (!row) return null;
    await row.update(data);
    return toPublicJson<AppSettingsEntity>(row);
  }
}

export const appSettingsRepository = new AppSettingsRepository();
