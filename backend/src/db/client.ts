import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

if (!env.databaseUrl) {
  /// implement switch to mock data
}

const queryClient = postgres(env.databaseUrl || "postgres://localhost/placeholder", {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });
