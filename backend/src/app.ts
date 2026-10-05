import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import logger from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/error";

// Routes
import authRoutes from "./routes/auth";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";

export function createApp() {
  const app = express();

  // ─── Security headers ────────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // ─── CORS ────────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    config.cors.frontendUrl,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || config.isDev) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ─── Request parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ─── Request logging ─────────────────────────────────────────────────────────
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: (req) => req.url === "/api/health",
    })
  );

  // ─── Global rate limiter ─────────────────────────────────────────────────────
  app.use(
    "/api",
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please slow down." },
      },
    })
  );

  // ─── Health check ─────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", env: config.nodeEnv, ts: new Date().toISOString() } });
  });

  // ─── Routes ───────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);

  // ─── 404 + Error handlers ─────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
