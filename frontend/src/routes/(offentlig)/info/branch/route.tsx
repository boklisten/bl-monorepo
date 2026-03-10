import { Stack, Text, Title } from "@mantine/core";
import OpeningHoursBranchSelect from "@/features/info/OpeningHoursBranchSelect";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/branch")({
  head: () => ({
    meta: [
      { title: "Skoler og åpningstider | Boklisten.no" },
      {
        description: "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
      },
    ],
  }),
  component: BranchInfoPageLayout,
});

function BranchInfoPageLayout() {
  return (
    <>
      <Stack gap={5}>
        <Title>Åpningstider</Title>
        <Text size={"sm"} fs={"italic"}>
          Her vises åpningstider for privatist-filialer. VGS-elever får beskjed fra skolen om
          åpningstider.
        </Text>
      </Stack>
      <OpeningHoursBranchSelect />
      <Outlet />
    </>
  );
}
