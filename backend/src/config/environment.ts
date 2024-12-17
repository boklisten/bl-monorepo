import { isNullish } from "@backend/helper/typescript-helpers";
import { BlError } from "@shared/bl-error/bl-error";

export enum BlEnvironment {
  PORT = "PORT",
  SERVER_PATH = "SERVER_PATH",
  API_ENV = "API_ENV",
  LOG_LEVEL = "LOG_LEVEL",
  URI_WHITELIST = "URI_WHITELIST",
  ACCESS_TOKEN_SECRET = "ACCESS_TOKEN_SECRET",
  REFRESH_TOKEN_SECRET = "REFRESH_TOKEN_SECRET",
  SESSION_SECRET = "SESSION_SECRET",
  BL_API_URI = "BL_API_URI",
  CLIENT_URI = "CLIENT_URI",
  MONGODB_URI = "MONGODB_URI",
  DIBS_SECRET_KEY = "DIBS_SECRET_KEY",
  DIBS_URI = "DIBS_URI",
  FACEBOOK_CLIENT_ID = "FACEBOOK_CLIENT_ID",
  FACEBOOK_SECRET = "FACEBOOK_SECRET",
  GOOGLE_CLIENT_ID = "GOOGLE_CLIENT_ID",
  GOOGLE_SECRET = "GOOGLE_SECRET",
  SENDGRID_API_KEY = "SENDGRID_API_KEY",
  TWILIO_SMS_AUTH_TOKEN = "TWILIO_SMS_AUTH_TOKEN",
  TWILIO_SMS_SID = "TWILIO_SMS_SID",
  BRING_API_KEY = "BRING_API_KEY",
  BRING_API_ID = "BRING_API_ID",
}

const testPlaceHolders: Partial<Record<BlEnvironment, string>> = {
  [BlEnvironment.SENDGRID_API_KEY]: "SG.placeholder",
  [BlEnvironment.TWILIO_SMS_SID]: "AC.placeholder",
};

/**
 *
 *
 * @param key the environment variable key
 * @returns the value of the environment variable if the environment variable is present, and we are not in a test
 *
 * @throws BlError if the environment variable is not present, and we are not in a test
 */
export function assertEnv(key: BlEnvironment): string {
  const value = process.env[key];
  if (process.env[BlEnvironment.API_ENV] === "test")
    return testPlaceHolders[key] ?? "placeholder";
  if (isNullish(value)) {
    throw new BlError(`${key} is a required environment variable`).code(200);
  }
  return value;
}
