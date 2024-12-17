import LinkableBranchInfo from "@frontend/components/LinkableBranchInfo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

const BranchPage = async () => {
  return <LinkableBranchInfo cachedBranch={null} cachedOpeningHours={[]} />;
};

export default BranchPage;
