import { notifications } from "@mantine/notifications";
import { ShowNotificationOptions } from "@toolpad/core";

export const SUCCESS_NOTIFICATION = {
  severity: "success",
  autoHideDuration: 3000,
} as const satisfies ShowNotificationOptions;

export const ERROR_NOTIFICATION = {
  severity: "error",
  autoHideDuration: 5000,
} as const satisfies ShowNotificationOptions;

export function showErrorNotification({ message }: { message: string }) {
  notifications.show({
    title: "Noe gikk galt!",
    message,
    color: "red",
    autoClose: true,
  });
}

export function showInfoNotification({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  notifications.show({
    title,
    message,
    autoClose: true,
  });
}

export function showSuccessNotification({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  notifications.show({
    title,
    message,
    color: "green",
    autoClose: true,
  });
}
