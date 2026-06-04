import { Router } from "express";
import * as assetController from "../controllers/asset.controller";
import * as assetImageController from "../controllers/asset-image.controller";
import { assetImageUpload } from "../middlewares/asset-upload.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  assetImageAssetParam,
  assetImageIdParams,
  uploadAssetImageValidator,
} from "../validators/asset-image.validators";
import {
  assetTreeValidator,
  createAssetValidator,
  deleteAssetValidator,
  getAssetValidator,
  listAssetsValidator,
  updateAssetValidator,
} from "../validators/asset.validators";

const router = Router();

router.get("/tree", validate(assetTreeValidator), assetController.getAssetTree);
router.get("/", validate(listAssetsValidator), assetController.listAssets);
router.get("/:id/images", validate(assetImageAssetParam), assetImageController.listAssetImages);
router.post(
  "/:id/images",
  validate(uploadAssetImageValidator),
  assetImageUpload.single("file"),
  assetImageController.uploadAssetImage,
);
router.patch(
  "/:id/images/:imageId/primary",
  validate(assetImageIdParams),
  assetImageController.setPrimaryAssetImage,
);
router.delete(
  "/:id/images/:imageId",
  validate(assetImageIdParams),
  assetImageController.deleteAssetImage,
);
router.get("/:id", validate(getAssetValidator), assetController.getAsset);
router.post("/", validate(createAssetValidator), assetController.createAsset);
router.put("/:id", validate(updateAssetValidator), assetController.updateAsset);
router.delete("/:id", validate(deleteAssetValidator), assetController.deleteAsset);

export default router;
