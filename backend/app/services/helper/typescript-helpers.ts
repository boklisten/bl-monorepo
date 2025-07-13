import { ObjectId } from "mongodb";

export function isNullish(
  maybeNullish: unknown,
): maybeNullish is undefined | null {
  return maybeNullish == null;
}

export function isNotNullish<T>(
  maybeNullish: T | undefined | null,
): maybeNullish is T {
  return maybeNullish != null;
}

export function isBoolean(maybeBoolean: unknown): maybeBoolean is boolean {
  return typeof maybeBoolean === "boolean";
}

export function isNumber(maybeNumber: unknown): maybeNumber is number {
  return typeof maybeNumber === "number";
}

// Re-format BlDocument type to one fitting for mongoose schemas
// Recursively union string-fields with ObjectId (e.g. {b: string} => {b: string | ObjectId}), except if the field is
// named "type" (because that's reserved and errors)
export type ToSchema<T> = {
  [key in keyof T]: T[key] extends string
    ? key extends "type"
      ? T[key]
      : T[key] | ObjectId
    : T[key] extends "boolean" | "number"
      ? T[key]
      : ToSchema<T[key]>;
};
