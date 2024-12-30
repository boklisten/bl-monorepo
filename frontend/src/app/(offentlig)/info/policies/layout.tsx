import DynamicSubNav from "@frontend/components/info/DynamicSubNav";
import { termsAndConditionsTabs } from "@frontend/utils/constants";
import { ReactNode } from "react";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DynamicSubNav tabs={termsAndConditionsTabs} />
      {children}
    </>
  );
}
