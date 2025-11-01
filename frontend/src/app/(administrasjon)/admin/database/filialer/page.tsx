import { Metadata } from "next";

import BranchManager from "@/features/branches/BranchManager";

export const metadata: Metadata = {
  title: "Filialer",
};

export default function DatabaseBranchesPage() {
  return <BranchManager />;
}
