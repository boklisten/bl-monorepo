import { BlapiErrorResponse } from "@boklisten/backend/shared/src/blapi-response/blapi-error-response";

export type AuthResponse = {
  documentName: string;
  data: string;
}[];

export enum TextType {
  BLID,
  ISBN,
  UNKNOWN,
}

export type ScannedTextType = TextType.BLID | TextType.ISBN | TextType.UNKNOWN;

export interface MaybeEmptyEditableText {
  id: string;
  text: string | null;
}

export function verifyBlApiError(
  apiError: unknown,
): apiError is BlapiErrorResponse {
  const m = apiError as Record<string, unknown> | null | undefined;
  return (
    !!m &&
    typeof m["httpStatus"] === "number" &&
    (typeof m["code"] === "number" || m["code"] === undefined) &&
    (typeof m["msg"] === "string" || m["msg"] === undefined)
  );
}

export function assertBlApiError(
  blError: unknown,
): blError is BlapiErrorResponse {
  if (blError instanceof BlapiErrorResponse) return true;

  throw new Error("Unknown API error");
}
