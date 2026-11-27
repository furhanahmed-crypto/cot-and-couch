import { afterEach, describe, expect, test, vi } from "vitest";
import {
  AppError,
  actionError,
  actionOk,
  toActionError,
} from "@/lib/action-result";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("actionOk / actionError", () => {
  test("actionOk wraps data", () => {
    expect(actionOk({ id: "1" })).toEqual({ ok: true, data: { id: "1" } });
  });

  test("actionError carries the message", () => {
    expect(actionError("Name required")).toEqual({
      ok: false,
      error: "Name required",
    });
  });
});

describe("toActionError", () => {
  test("shows an AppError message to the user", () => {
    const result = toActionError(new AppError("Used by 3 products"), "Could not delete");
    expect(result).toEqual({ ok: false, error: "Used by 3 products" });
  });

  test("hides other errors behind the fallback and logs them", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = toActionError(new Error("duplicate key value"), "Could not delete");
    expect(result).toEqual({ ok: false, error: "Could not delete" });
    expect(log).toHaveBeenCalledOnce();
  });
});
