import { defineConfig } from "drizzle-kit";
import { config as dotenvConfig } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

dotenvConfig({ path: resolve(configDir, ".env") });
process.chdir(configDir);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle migrations");
}

const connectionUrl = new URL(databaseUrl);

if (!connectionUrl.searchParams.has("sslmode")) {
  connectionUrl.searchParams.set("sslmode", "require");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl.toString(),
  },
  schemaFilter: ["public"],
});
