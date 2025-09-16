import { Metadata } from "next";

import Branches from "@/features/branches/Branches";

export const metadata: Metadata = {
  title: "Filialer",
};

export default function DatabaseBranchesPage() {
  return <Branches />;
}
