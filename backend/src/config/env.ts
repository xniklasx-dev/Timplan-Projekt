import { config as dotenvConfig } from "dotenv";
import { parsePort, isAzure} from "../utils/envUtils.js";

if (!isAzure) {
  dotenvConfig();
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? (isAzure ? "production" : "development"),
  port: parsePort(process.env.PORT, 3001),
  databaseUrl: process.env.DATABASE_URL ?? "",
  dataSource: process.env.DATA_SOURCE ?? (process.env.DATABASE_URL ? "postgresql" : "memory"),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",") as string[]
} as const;