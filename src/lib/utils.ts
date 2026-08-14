import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Supabase/Postgrest errors are plain objects, not Error instances — pull a readable message out of anything. */
export function errorMessage(error: unknown, fallback = "The request could not be completed."): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const candidate = error as { message?: unknown; error_description?: unknown; details?: unknown; hint?: unknown };
    for (const value of [candidate.message, candidate.error_description, candidate.details, candidate.hint]) {
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
}
