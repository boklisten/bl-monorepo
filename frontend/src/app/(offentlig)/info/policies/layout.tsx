import { ReactNode } from "react";

import DynamicSubNav from "@/components/info/DynamicSubNav";
import { termsAndConditionsTabs } from "@/utils/constants";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DynamicSubNav tabs={termsAndConditionsTabs} />
      {children}
    </>
  );
}
