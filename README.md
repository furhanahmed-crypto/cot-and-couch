# Cot & Couch

Showroom website for Cot & Couch: product catalogue, shortlist and saved cart for customers, and a staff console at `/admin`.

## Setup

1. Install Node 20+ and Bun.
2. Create a Neon project with **Auth** enabled. Add `http://localhost:3000` to Auth → Domains.
3. Fill `.env.local` with the variables listed in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#environment-variables).
4. Run:

```bash
bun install
bun run db:migrate
bun run db:seed
bun run db:check
bun run dev
```

Open http://localhost:3000 and register.

## Staff access

Staff sign in at `/login` like customers. Sign up once, then either:

- add your email to `SEED_STAFF_EMAILS` in `.env.local` (comma-separated) and run `bun run db:seed`, or
- run in the Neon SQL editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

Use `team` instead of `admin` for limited access. After that, an admin can give other people access from **Team** in the staff console.

## Docs

Everything else is in [docs/](./docs/README.md).
