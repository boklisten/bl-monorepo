import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import EditableTextTable from "@/components/info/editable-text/EditableTextTable";

export const metadata: Metadata = {
  title: "Dynamisk innhold",
};

export default function EditableTextPage() {
  return (
    <Stack>
      <Title>Dynamisk innhold</Title>
      <EditableTextTable />
    </Stack>
  );
}
