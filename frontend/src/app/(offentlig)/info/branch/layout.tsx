import { Stack, Text, Title } from "@mantine/core";
import { Metadata } from "next";

import OpeningHoursBranchSelect from "@/features/info/OpeningHoursBranchSelect";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

export default function BranchInfoPageLayout({
  children,
}: LayoutProps<"/info/branch">) {
  return (
    <>
      <Stack gap={5}>
        <Title>Åpningstider</Title>
        <Text size={"sm"} fs={"italic"}>
          Her vises åpningstider for privatist-filialer. VGS-elever får beskjed
          fra skolen om åpningstider.
        </Text>
      </Stack>
      <OpeningHoursBranchSelect />
      {children}
    </>
  );
}
