import { ReactNode } from "react";

import ClientLayout from "@/app/(offentlig)/info/policies/ClientLayout";

export default function PoliciesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ClientLayout />
      {children}
    </>
  );
}
