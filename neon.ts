import { defineConfig } from "@neon/config/v1";

/** Postgres is always on; Auth = Managed Better Auth on this branch. */
export default defineConfig({
  auth: true,
});
