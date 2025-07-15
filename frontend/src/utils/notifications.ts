import { ShowNotificationOptions } from "@toolpad/core";

export const SUCCESS_NOTIFICATION = {
  severity: "success",
  autoHideDuration: 3000,
} as const satisfies ShowNotificationOptions;

export const ERROR_NOTIFICATION = {
  severity: "error",
  autoHideDuration: 5000,
} as const satisfies ShowNotificationOptions;
