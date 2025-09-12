import { Alert, AlertProps } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function WarningAlert(props: AlertProps) {
  return (
    <Alert icon={<IconAlertTriangle />} color={"orange"} {...props}>
      {props.children}
    </Alert>
  );
}
