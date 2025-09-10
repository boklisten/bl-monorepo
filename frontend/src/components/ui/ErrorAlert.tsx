import { Alert } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";

export default function ErrorAlert(
  props:
    | {
        title?: string;
        message?: string;
      }
    | { generic: true },
) {
  return (
    <Alert
      icon={<IconExclamationCircle />}
      color={"red"}
      title={"generic" in props ? "Noe gikk galt!" : props.title}
    >
      {"generic" in props
        ? "Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer"
        : props.message}
    </Alert>
  );
}
