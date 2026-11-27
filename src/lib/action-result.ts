import type { ActionResult } from "@/types/action";

/**
 * Throw this from a service for an expected problem the user should read,
 * e.g. `throw new AppError("Used by 3 products. Deactivate it instead.")`.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function actionOk(): ActionResult<void>;
export function actionOk<T>(data: T): ActionResult<T>;
export function actionOk<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function actionError(message: string): ActionResult<never> {
  return { ok: false, error: message };
}

/**
 * Turns any thrown error into a safe result.
 * AppError messages are shown as they are; anything else is logged and
 * replaced with `fallbackMessage` so raw DB errors never reach the UI.
 */
export function toActionError(
  error: unknown,
  fallbackMessage: string,
): ActionResult<never> {
  if (error instanceof AppError) return actionError(error.message);
  console.error(`[action] ${fallbackMessage}`, error);
  return actionError(fallbackMessage);
}
