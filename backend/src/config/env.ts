import { isNullish } from "@backend/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";

const testPlaceHolders: Record<string, string> = {
  SENDGRID_API_KEY: "SG.placeholder",
  TWILIO_SMS_SID: "AC.placeholder",
};

/**
 *
 * @param key the environment variable key
 * @returns the value of the environment variable if the environment variable is present, and we are not in a test
 *
 * @throws BlError if the environment variable is not present, and we are not in a test
 */
function assertEnv(key: string): string {
  const value = process.env[key];
  if (process.env["API_ENV"] === "test")
    return testPlaceHolders[key] ?? "placeholder";
  if (isNullish(value)) {
    throw new BlError(`${key} is a required environment variable`).code(200);
  }
  return value;
}

export const BlEnv = {
  PORT: assertEnv("PORT"),
  SERVER_PATH: assertEnv("SERVER_PATH"),
  API_ENV: assertEnv("API_ENV"),
  LOG_LEVEL: assertEnv("LOG_LEVEL"),
  URI_WHITELIST: assertEnv("URI_WHITELIST"),
  ACCESS_TOKEN_SECRET: assertEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: assertEnv("REFRESH_TOKEN_SECRET"),
  SESSION_SECRET: assertEnv("SESSION_SECRET"),
  BL_API_URI: assertEnv("BL_API_URI"),
  CLIENT_URI: assertEnv("CLIENT_URI"),
  MONGODB_URI: assertEnv("MONGODB_URI"),
  DIBS_SECRET_KEY: assertEnv("DIBS_SECRET_KEY"),
  DIBS_URI: assertEnv("DIBS_URI"),
  FACEBOOK_CLIENT_ID: assertEnv("FACEBOOK_CLIENT_ID"),
  FACEBOOK_SECRET: assertEnv("FACEBOOK_SECRET"),
  GOOGLE_CLIENT_ID: assertEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_SECRET: assertEnv("GOOGLE_SECRET"),
  SENDGRID_API_KEY: assertEnv("SENDGRID_API_KEY"),
  TWILIO_SMS_AUTH_TOKEN: assertEnv("TWILIO_SMS_AUTH_TOKEN"),
  TWILIO_SMS_SID: assertEnv("TWILIO_SMS_SID"),
  BRING_API_KEY: assertEnv("BRING_API_KEY"),
  BRING_API_ID: assertEnv("BRING_API_ID"),
  SENTRY_AUTH_TOKEN: assertEnv("SENTRY_AUTH_TOKEN"),
};
