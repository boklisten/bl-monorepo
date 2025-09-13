import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import EditableTextTable from "@/components/info/editable-text/EditableTextTable";
import QuestionsAndAnswersTable from "@/components/info/questions-and-answers/QuestionsAndAnswersTable";

export const metadata: Metadata = {
  title: "Dynamisk innhold",
};

export default function EditableTextPage() {
  return (
    <Stack gap={"xl"}>
      <Title>Dynamisk innhold</Title>
      <Stack gap={"xs"}>
        <Title order={2}>Tekst</Title>
        <EditableTextTable />
      </Stack>
      <Stack gap={"xs"}>
        <Title order={2}>Spørsmål og svar</Title>
        <QuestionsAndAnswersTable />
      </Stack>
    </Stack>
  );
}
