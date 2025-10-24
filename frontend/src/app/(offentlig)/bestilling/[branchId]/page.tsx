import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import SelectSubjects from "@/features/subjects/SelectSubjects";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bestill bøker",
  description:
    "Velg hvilken skole og hvilke fag du tar, så finner vi bøkene du trenger for deg!",
};

export default async function SelectSubjectsPage({
  params,
}: PageProps<"/bestilling/[branchId]">) {
  const { branchId } = await params;
  const cachedSubjects = await publicApiClient
    .subjects({ branchId })
    .$get()
    .unwrap();

  return (
    <Container size={"md"}>
      <Stack gap={"xs"}>
        <Title>Hvilke fag tar du?</Title>
        <SelectSubjects branchId={branchId} cachedSubjects={cachedSubjects} />
      </Stack>
    </Container>
  );
}
