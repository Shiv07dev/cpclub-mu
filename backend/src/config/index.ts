import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env["PORT"] ?? "5000", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  isDev: (process.env["NODE_ENV"] ?? "development") === "development",

  database: {
    url: required("DATABASE_URL"),
  },

  jwt: {
    secret: process.env["JWT_SECRET"] ?? "dev-secret-change-in-production",
    refreshSecret: process.env["JWT_REFRESH_SECRET"] ?? "dev-refresh-secret-change-in-production",
    expiresIn: process.env["JWT_EXPIRES_IN"] ?? "15m",
    refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d",
  },

  cors: {
    frontendUrl: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  },

  rateLimit: {
    windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] ?? "900000", 10),
    max: parseInt(process.env["RATE_LIMIT_MAX"] ?? "100", 10),
    authMax: parseInt(process.env["AUTH_RATE_LIMIT_MAX"] ?? "10", 10),
    registrationMax: parseInt(process.env["REGISTRATION_RATE_LIMIT_MAX"] ?? "5", 10),
  },

  storage: {
    provider: (process.env["STORAGE_PROVIDER"] ?? "local") as "supabase" | "cloudinary" | "local",
    supabaseUrl: process.env["SUPABASE_URL"] ?? "",
    supabaseServiceRoleKey: process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "",
    storageBucket: process.env["STORAGE_BUCKET"] ?? "cpclub-uploads",
    cloudinaryCloudName: process.env["CLOUDINARY_CLOUD_NAME"] ?? "",
    cloudinaryApiKey: process.env["CLOUDINARY_API_KEY"] ?? "",
    cloudinaryApiSecret: process.env["CLOUDINARY_API_SECRET"] ?? "",
    uploadDir: process.env["UPLOAD_DIR"] ?? "./uploads",
  },

  seed: {
    adminEmail: process.env["SEED_ADMIN_EMAIL"] ?? "admin@cpclub.mu.ac.in",
    adminPassword: process.env["SEED_ADMIN_PASSWORD"] ?? "ChangeMe@2024!",
    adminName: process.env["SEED_ADMIN_NAME"] ?? "CP Club Admin",
  },

  log: {
    level: process.env["LOG_LEVEL"] ?? "info",
  },
};
