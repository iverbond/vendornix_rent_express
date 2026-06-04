import { Router } from "express";
import { env } from "../config/env";
import { sendSuccess } from "../utils/response";
import assetsRoutes from "./assets.routes";
import membershipsRoutes from "./memberships.routes";
import organizationsRoutes from "./organizations.routes";
import settingsRoutes from "./settings.routes";
import usersRoutes from "./users.routes";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, `${env.APP_NAME} is healthy.`, { version: "1.0.0" });
});

router.use("/users", usersRoutes);
router.use("/organizations", organizationsRoutes);
router.use("/memberships", membershipsRoutes);
router.use("/assets", assetsRoutes);
router.use("/settings", settingsRoutes);

export default router;
