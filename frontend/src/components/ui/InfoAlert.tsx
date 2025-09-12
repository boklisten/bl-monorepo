import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export default function InfoAlert(props: { title: string; message: string }) {
  return (
    <Alert icon={<IconInfoCircle />} title={props.title}>
      {props.message}
    </Alert>
  );
}
