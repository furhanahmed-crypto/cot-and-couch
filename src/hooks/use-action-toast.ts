"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/types/action";

export type ActionToastMessages = {
  loading: string;
  success: string;
  /** Shown when the action fails without its own message. */
  error: string;
};

/**
 * The only way client code runs a server action that changes data.
 * Shows a loading toast, then success or error, and exposes `isPending`
 * so buttons can be disabled while the action runs.
 */
export function useActionToast() {
  const [isPending, startTransition] = useTransition();

  function run<T>(
    action: () => Promise<ActionResult<T>>,
    messages: ActionToastMessages,
    onSuccess?: (data: T) => void,
  ) {
    startTransition(async () => {
      const toastId = toast.loading(messages.loading);
      const result = await runSafely(action, messages.error);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      toast.success(messages.success, { id: toastId });
      onSuccess?.(result.data);
    });
  }

  return { run, isPending };
}

/** Network failures throw instead of returning a result; turn them into one. */
async function runSafely<T>(
  action: () => Promise<ActionResult<T>>,
  errorMessage: string,
): Promise<ActionResult<T>> {
  try {
    return await action();
  } catch {
    return { ok: false, error: errorMessage };
  }
}
