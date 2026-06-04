import fs from "fs";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";
import { env } from "../config/env";
const ensureAssetUploadDir = (assetId: string): string => {
  const dir = path.join(env.UPLOAD_DIR, "assets", assetId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const assetId = String(req.params.id ?? "");
    if (!assetId) {
      cb(new Error("Asset id is required."), "");
      return;
    }
    try {
      cb(null, ensureAssetUploadDir(assetId));
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const maxBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export const assetImageUpload = multer({
  storage,
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Unsupported image type."));
  },
});
