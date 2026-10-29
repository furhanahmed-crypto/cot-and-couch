import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/db/schema-enums.ts",
    "./src/db/schema-coc.ts",
    "./src/db/schema-coc-catalogue.ts",
    "./src/db/schema-coc-shop.ts",
    "./src/db/schema-coc-crm.ts",
    "./src/db/schema-coc-commerce.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
});
