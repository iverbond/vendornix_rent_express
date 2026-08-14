import { Router } from "express";
import { env } from "../config/env";
import { authenticate } from "../middlewares/auth.middleware";
import { sendSuccess } from "../utils/response";
import assetsRoutes from "./assets.routes";
import authRoutes from "./auth.routes";
import clientsRoutes from "./clients.routes";
import rentalsRoutes from "./rentals.routes";
import membershipsRoutes from "./memberships.routes";
import organizationsRoutes from "./organizations.routes";
import paymentsRoutes from "./payments.routes";
import settingsRoutes from "./settings.routes";
import usersRoutes from "./users.routes";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, `${env.APP_NAME} is healthy.`, { version: "1.0.0" });
});

// Public routes (must stay ahead of the `authenticate` gate below).
router.use("/auth", authRoutes);

// Everything below requires a valid Bearer access token.
router.use(authenticate);

router.use("/users", usersRoutes);
router.use("/organizations", organizationsRoutes);
router.use("/memberships", membershipsRoutes);
router.use("/assets", assetsRoutes);
router.use("/clients", clientsRoutes);
router.use("/rentals", rentalsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/settings", settingsRoutes);

export default router;
