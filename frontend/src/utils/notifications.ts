import { MantineColor } from "@mantine/core";
import { NotificationData, notifications } from "@mantine/notifications";

function showNotification(
  data: string | NotificationData,
  color: MantineColor,
) {
  if (typeof data === "string") {
    notifications.show({
      message: data,
      color,
      autoClose: true,
    });
  } else {
    notifications.show({
      color,
      autoClose: true,
      ...data,
    });
  }
}

export function showErrorNotification(data: string | NotificationData) {
  if (typeof data === "string") {
    notifications.show({
      title: data,
      message: "Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer!",
      color: "red",
      autoClose: 6000,
    });
  } else {
    notifications.show({
      color: "red",
      autoClose: 6000,
      ...data,
    });
  }
}

export function showInfoNotification(data: string | NotificationData) {
  showNotification(data, "blue");
}

export function showSuccessNotification(data: string | NotificationData) {
  showNotification(data, "green");
}
