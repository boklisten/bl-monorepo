import { Alert, AlertProps } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";

export default function ErrorAlert(props: AlertProps) {
  return (
    <Alert icon={<IconExclamationCircle />} color={"red"} {...props}>
      {props.children}
    </Alert>
  );
}
