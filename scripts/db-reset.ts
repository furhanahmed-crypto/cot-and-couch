/**
 * Deletes every app table, type, function and the migration history, then
 * runs all migrations again. Neon Auth (schema `neon_auth`) and extensions
 * are not touched.
 *
 * Run: bun run db:reset --yes
 */
import { execSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";

// Objects that belong to an extension (e.g. pg_session_jwt) are skipped.
const DROP_APP_OBJECTS = `
DO $$
DECLARE
  item record;
BEGIN
  DROP SCHEMA IF EXISTS drizzle CASCADE;

  FOR item IN
    SELECT c.oid::regclass AS name FROM pg_class c
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r', 'p')
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %s CASCADE', item.name);
  END LOOP;

  FOR item IN
    SELECT c.oid::regclass AS name FROM pg_class c
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'S'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('DROP SEQUENCE IF EXISTS %s CASCADE', item.name);
  END LOOP;

  FOR item IN
    SELECT t.oid::regtype AS name FROM pg_type t
    WHERE t.typnamespace = 'public'::regnamespace AND t.typtype = 'e'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = t.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('DROP TYPE IF EXISTS %s CASCADE', item.name);
  END LOOP;

  FOR item IN
    SELECT p.oid::regprocedure AS name FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', item.name);
  END LOOP;
END;
$$;
`;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED is missing in .env.local");
  return url;
}

async function resetDatabase() {
  if (!process.argv.includes("--yes")) {
    console.error("This deletes every app table and all its data.");
    console.error("Run again with --yes to confirm: bun run db:reset --yes");
    process.exit(1);
  }

  const sql = neon(getDatabaseUrl());
  await sql.query(DROP_APP_OBJECTS);
  console.log("App tables dropped. Running migrations…");
  execSync("bunx drizzle-kit migrate", { stdio: "inherit" });
}

resetDatabase().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
