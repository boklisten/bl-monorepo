import { Title } from "@mantine/core";
import { Metadata } from "next";

import BranchSelect from "@/components/BranchSelect";
import BranchLocationInfo from "@/components/info/BranchLocationInfo";
import BranchOpeningHours from "@/components/info/BranchOpeningHoursInfo";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

export default async function BranchPage({
  params,
}: PageProps<"/info/branch/[branchId]">) {
  const { branchId } = await params;

  return (
    <>
      <Title>Åpningstider</Title>
      <BranchSelect />
      <BranchLocationInfo branchId={branchId} />
      <BranchOpeningHours branchId={branchId} />
    </>
  );
}
