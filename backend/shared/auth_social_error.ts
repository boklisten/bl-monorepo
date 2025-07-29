export type AuthSocialError =
  | "access_denied"
  | "expired"
  | "no_email"
  | "error";

export const AUTH_SOCIAL_ERROR = {
  ACCESS_DENIED: "access_denied",
  EXPIRED: "expired",
  NO_EMAIL: "no_email",
  ERROR: "error",
} as const satisfies Record<Uppercase<AuthSocialError>, AuthSocialError>;
