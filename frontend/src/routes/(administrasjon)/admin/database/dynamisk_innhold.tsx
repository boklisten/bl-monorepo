import { Stack, Title } from "@mantine/core";
import EditableTextTable from "@/features/editable-texts/EditableTextTable.tsx";
import QuestionsAndAnswersTable from "@/features/questions-and-answers/QuestionsAndAnswersTable.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(administrasjon)/admin/database/dynamisk_innhold")({
  head: () => ({
    meta: [{ title: "Dynamisk innhold | bl-admin" }],
  }),
  component: EditableTextPage,
});

function EditableTextPage() {
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
