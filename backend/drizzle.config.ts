import { defineConfig } from "drizzle-kit";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
});
