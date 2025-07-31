export type AuthVippsError = "access_denied" | "expired" | "error";

export const AUTH_VIPPS_ERROR = {
  ACCESS_DENIED: "access_denied",
  EXPIRED: "expired",
  ERROR: "error",
} as const satisfies Record<Uppercase<AuthVippsError>, AuthVippsError>;
