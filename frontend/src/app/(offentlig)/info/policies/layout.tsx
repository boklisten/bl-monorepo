import { ReactNode } from "react";

import PoliciesNavigation from "@/app/(offentlig)/info/policies/PoliciesNavigation";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PoliciesNavigation />
      {children}
    </>
  );
}
