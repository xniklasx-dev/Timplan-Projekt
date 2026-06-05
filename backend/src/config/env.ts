import { config as dotenvConfig } from "dotenv";
import { parsePort, parseList, isAzure, parseDataSource } from "./envParser.js";

if (!isAzure) {
  dotenvConfig();
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? (isAzure ? "production" : "development"),
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT, 3001),
  databaseUrl: process.env.DATABASE_URL ?? "",
  dataSource: parseDataSource(process.env.DATA_SOURCE),

  allowedOrigins: (() => {
    const list = parseList(process.env.ALLOWED_ORIGINS);
    if (list.length > 0) return list;

    const localDefaults = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://0.0.0.0:3000",
    ];

    return localDefaults;
  })(),
} as const;
