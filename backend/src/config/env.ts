import { config as dotenvConfig } from "dotenv";

const isAzure =
  Boolean(process.env.WEBSITE_SITE_NAME) ||
  Boolean(process.env.WEBSITE_INSTANCE_ID) ||
  Boolean(process.env.WEBSITE_HOSTNAME);

if (!isAzure) {
  dotenvConfig();
}

function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parsePort(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? (isAzure ? "production" : "development"),
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT, 3001),

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
