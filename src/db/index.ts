import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** The one database client. Tables: `import { products } from "@/db/schema"`. */
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
