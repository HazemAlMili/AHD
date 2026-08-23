import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { ZodError } from "zod";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const allowedOrigins = new Set((process.env.AHD_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean));

function isAllowedOrigin(req: express.Request): boolean {
  const origin = req.get("origin");
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    if (parsed.host === req.get("host")) return true;
    if (allowedOrigins.has(origin)) return true;
    return process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  } catch { return false; }
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors((req, callback) => callback(null, { origin: isAllowedOrigin(req), credentials: true })));
app.use(cookieParser());
app.use(express.json({ limit: "256kb" }));

app.use("/api/v1/admin", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method) || isAllowedOrigin(req)) { next(); return; }
  res.status(403).json({ message: "Admin request origin is not allowed" });
});

app.use("/api", router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  logger.error({ err: error }, "Request failed");
  if (res.headersSent) return;
  const details = typeof error === "object" && error ? error as { code?: string; type?: string } : {};
  if (error instanceof ZodError || details.type === "entity.parse.failed") { res.status(400).json({ message: "Invalid request" }); return; }
  if (details.code === "23505") { res.status(409).json({ message: "A record with these values already exists" }); return; }
  if (details.code === "23503") { res.status(400).json({ message: "A related record is invalid" }); return; }
  if (message.includes("DATABASE_URL") || message.includes("DATABASE_SCHEMA_MIGRATION_REQUIRED")) { res.status(503).json({ message: "Database is not ready; run the database migration command before serving traffic." }); return; }
  if (message.includes("Media storage is not configured")) { res.status(503).json({ message: "Media storage is not configured" }); return; }
  res.status(500).json({ message: "Request could not be completed" });
});

export default app;
