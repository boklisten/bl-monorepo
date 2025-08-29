import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import BranchSelect from "@/components/BranchSelect";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

export default function BranchPage() {
  return (
    <Stack align={"center"}>
      <Title order={2}>Velg din skole</Title>
      <BranchSelect />
    </Stack>
  );
}
