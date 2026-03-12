const PRODUCTION = "production";

export function getEnv() {
  return import.meta.env["VITE_APP_ENV"] ?? PRODUCTION;
}
export function isProduction() {
  return getEnv() === PRODUCTION;
}
