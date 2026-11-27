/**
 * Runs scripts/db-smoke.sql: bad rows must be rejected and triggers must fire.
 * The SQL always ends with an error, so Postgres rolls back every test row.
 * That final error starts with DB_CHECK_PASSED when all checks passed.
 *
 * Run: bun run db:check
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const PASSED_PREFIX = "DB_CHECK_PASSED";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED is missing in .env.local");
  return url;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runChecks() {
  const sql = neon(getDatabaseUrl());
  const smokeSql = readFileSync(new URL("./db-smoke.sql", import.meta.url), "utf8");
  try {
    await sql.query(smokeSql);
  } catch (error) {
    const message = errorMessage(error);
    if (message.startsWith(PASSED_PREFIX)) {
      console.log(`db:check passed (${message.slice(PASSED_PREFIX.length + 1).trim()})`);
      return;
    }
    console.error(`db:check failed: ${message}`);
    process.exit(1);
  }
  console.error("db:check failed: the smoke SQL finished without its final marker");
  process.exit(1);
}

runChecks();
