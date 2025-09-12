import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import EditableTextManager from "@/components/info/editable-text/EditableTextManager";

export const metadata: Metadata = {
  title: "Dynamisk innhold",
};

export default function EditableTextPage() {
  return (
    <Stack>
      <Title>Dynamisk innhold</Title>
      <EditableTextManager />
    </Stack>
  );
}
