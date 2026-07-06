import type { Context } from "hono";

export type ApiErrorCode =
  | "INTERNAL_ERROR"
  | "NOT_FOUND"
  | "PLAN_GENERATION_FAILED"
  | "PLAN_NOT_FOUND"
  | "PLAN_NOT_READY"
  | "VALIDATION_ERROR";

export function apiError(code: ApiErrorCode, message: string) {
  return {
    error: {
      code,
      message,
    },
  };
}

export function validationError(_result: { error: unknown }, c: Context) {
  return c.json(apiError("VALIDATION_ERROR", "Request validation failed."), 400);
}
