import { connection } from "next/server";

/** Admin routes always run at request time (fresh DB, staff session). */
export async function ensureAdminRequest() {
  await connection();
}
