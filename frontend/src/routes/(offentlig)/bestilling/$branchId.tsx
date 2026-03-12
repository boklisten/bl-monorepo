import { Container, Stack, Title } from "@mantine/core";
import SelectSubjects from "@/features/subjects/SelectSubjects.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/bestilling/$branchId")({
  head: () => ({
    meta: [
      { title: "Bestill bøker | Boklisten.no" },
      {
        description:
          "Velg hvilken skole og hvilke fag du tar, så finner vi bøkene du trenger for deg!",
      },
    ],
  }),
  component: SelectSubjectsPage,
});

function SelectSubjectsPage() {
  const { branchId } = Route.useParams();

  return (
    <Container size={"md"}>
      <Stack gap={"xs"}>
        <Title>Hvilke fag tar du?</Title>
        <SelectSubjects branchId={branchId} />
      </Stack>
    </Container>
  );
}
