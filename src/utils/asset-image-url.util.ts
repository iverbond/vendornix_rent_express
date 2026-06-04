import path from "path";
import { env } from "../config/env";

export const buildAssetImagePublicPath = (assetId: string, fileName: string): string =>
  `/uploads/assets/${assetId}/${fileName}`;

export const buildAssetImagePublicUrl = (assetId: string, fileName: string): string => {
  const base = env.PUBLIC_BASE_URL.replace(/\/$/, "");
  return `${base}${buildAssetImagePublicPath(assetId, fileName)}`;
};

export const resolveAssetImageDiskPath = (assetId: string, fileName: string): string =>
  path.join(env.UPLOAD_DIR, "assets", assetId, fileName);
