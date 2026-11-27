import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { DEFAULT_STAFF_EMAILS, DEMO_CUSTOMERS } from "./data/demo";
import { db } from "./db";
import { newId } from "./helpers";

export type SeededPerson = { id: string; name: string; phone: string | null };
type AuthUser = { id: string; email: string; name: string | null };

function getStaffEmails(): string[] {
  const fromEnv = process.env.SEED_STAFF_EMAILS?.split(",").map((email) => email.trim()).filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_STAFF_EMAILS;
}

/** Staff must already have a Neon Auth account (sign up once in the app). */
async function findAuthUsers(emails: string[]): Promise<AuthUser[]> {
  const emailList = sql.join(emails.map((email) => sql`${email}`), sql`, `);
  const result = await db.execute(sql`select id, email, name from neon_auth."user" where email in (${emailList})`);
  return result.rows as AuthUser[];
}

export async function seedPeople() {
  const emails = getStaffEmails();
  const authUsers = await findAuthUsers(emails);
  const missing = emails.filter((email) => !authUsers.some((user) => user.email === email));
  if (missing.length) console.warn(`No Neon Auth account for: ${missing.join(", ")} (skipped)`);

  const staffRows = authUsers.map((user) => ({
    id: newId(), authUserId: user.id, email: user.email, name: user.name, role: "admin" as const,
  }));
  // Dummy customers have no Neon Auth account, so they get a random auth id.
  const customerRows = DEMO_CUSTOMERS.map((customer, index) => ({
    id: newId(),
    authUserId: newId(),
    name: customer.name,
    email: `test-customer-${index + 1}@example.com`,
    phone: customer.phone,
    address: `Test address ${index + 1}, ${customer.area}, Hyderabad`,
    role: "customer" as const,
  }));

  await db.insert(schema.profiles).values([...staffRows, ...customerRows]);

  const staff: SeededPerson[] = staffRows.map((row) => ({ id: row.id, name: row.name ?? row.email, phone: null }));
  const customers: SeededPerson[] = customerRows.map((row) => ({ id: row.id, name: row.name, phone: row.phone }));
  return { staff, customers };
}
