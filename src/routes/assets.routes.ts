import { Router } from "express";
import * as assetController from "../controllers/asset.controller";
import { validate } from "../middlewares/validation.middleware";
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
router.get("/:id", validate(getAssetValidator), assetController.getAsset);
router.post("/", validate(createAssetValidator), assetController.createAsset);
router.put("/:id", validate(updateAssetValidator), assetController.updateAsset);
router.delete("/:id", validate(deleteAssetValidator), assetController.deleteAsset);

export default router;
