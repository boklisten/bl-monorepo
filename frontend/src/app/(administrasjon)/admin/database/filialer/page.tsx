import { Metadata } from "next";

import Branches from "@/components/admin/Branches";

export const metadata: Metadata = {
  title: "Filialer",
};

export default function DatabaseBranchesPage() {
  return <Branches />;
}
