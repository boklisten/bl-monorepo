import { Title } from "@mantine/core";
import { Metadata } from "next";

import BranchSelect from "@/features/branches/BranchSelect";

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
      <Title>Åpningstider</Title>
      <BranchSelect />
      {children}
    </>
  );
}
