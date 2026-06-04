import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "./config/env";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import { apiRateLimiter } from "./providers/rate-limiter.provider";
import apiRouter from "./routes";

const app = express();

if (env.TRUST_PROXY !== "false") {
  app.set("trust proxy", env.TRUST_PROXY === "true" ? 1 : env.TRUST_PROXY);
}

app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",") }));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(hpp());
app.use(apiRateLimiter);
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: `${env.APP_NAME} running`,
    data: { health: "ok", api: env.API_PREFIX },
  });
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.use(env.API_PREFIX, apiRouter);
// Legacy prefix kept during migration (same routes as /api)
if (env.API_PREFIX !== "/api/v1") {
  app.use("/api/v1", apiRouter);
}
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
