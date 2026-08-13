import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern for Next.js dev hot reloads
const globalForDb = globalThis as unknown as {
  _pgClient: postgres.Sql | undefined;
};

if (!globalForDb._pgClient) {
  globalForDb._pgClient = postgres(connectionString, { prepare: false });
}

export const db = drizzle(globalForDb._pgClient, { schema });
