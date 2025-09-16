const PRODUCTION = "production";

export function getEnv() {
  return process.env["NEXT_PUBLIC_APP_ENV"] ?? PRODUCTION;
}
export function isProduction() {
  return getEnv() === PRODUCTION;
}
