import { AppError } from "@/lib/action-result";

/** Postgres error codes the admin turns into friendly messages. */
export const PG_UNIQUE_VIOLATION = "23505";

type PgErrorLike = { code?: unknown; constraint?: unknown; cause?: unknown };

/** The Postgres error under Drizzle's wrapper (it is in `cause`). */
function findPgError(error: unknown): PgErrorLike | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth += 1) {
    const candidate = current as PgErrorLike;
    if (typeof candidate.code === "string") return candidate;
    current = candidate.cause;
  }
  return null;
}

export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  const pgError = findPgError(error);
  if (pgError?.code !== PG_UNIQUE_VIOLATION) return false;
  return !constraint || pgError.constraint === constraint;
}

/**
 * Runs a write; a duplicate (unique violation) becomes an AppError with a
 * clear message, e.g. "This variant already exists".
 */
export async function withUniqueMessage<T>(write: () => Promise<T>, message: string, constraint?: string): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (isUniqueViolation(error, constraint)) throw new AppError(message);
    throw error;
  }
}
