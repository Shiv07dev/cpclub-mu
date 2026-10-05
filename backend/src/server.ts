import { createApp } from "./app";
import { config } from "./config";
import logger from "./config/logger";
import prisma from "./config/prisma";

async function main() {
  // Verify database connection before starting
  try {
    await prisma.$connect();
    logger.info("✅ Database connected");
  } catch (err) {
    logger.error("❌ Database connection failed", { error: err });
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`🚀 CP Club API running on port ${config.port} [${config.nodeEnv}]`);
    logger.info(`   Health: http://localhost:${config.port}/api/health`);
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Server closed");
      process.exit(0);
    });
    // Force kill after 10s
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error("Fatal startup error", { error: err });
  process.exit(1);
});
