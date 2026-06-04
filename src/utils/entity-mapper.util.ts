import { Model } from "sequelize";

export const toPublicJson = <T>(model: Model): T => {
  const json = model.toJSON() as Record<string, unknown>;
  delete json.password;
  delete json.deletedAt;
  return json as T;
};
