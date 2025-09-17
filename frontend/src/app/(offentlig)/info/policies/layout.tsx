import { ReactNode } from "react";

import PoliciesNavigation from "@/features/info/PoliciesNavigation";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PoliciesNavigation />
      {children}
    </>
  );
}
