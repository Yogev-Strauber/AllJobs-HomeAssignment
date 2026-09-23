import { ApiError } from "@/services/api-client";

export function describeError(
  error: unknown,
  fallback = "Something went wrong.",
) {
  if (error instanceof ApiError) return error.message;
  return fallback;
}
