import { ReactNode } from "react";

import DynamicSubNav from "@/components/info/DynamicSubNav";
import { TERMS_AND_CONDITIONS_TABS } from "@/utils/constants";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DynamicSubNav tabs={TERMS_AND_CONDITIONS_TABS} />
      {children}
    </>
  );
}
