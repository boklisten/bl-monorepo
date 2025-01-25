import { Card } from "@mui/material";
import { ReactNode } from "react";

import DynamicNav from "@/components/info/DynamicNav";
import { infoPageTabs } from "@/utils/constants";

export default function InfoPageLayout({ children }: { children: ReactNode }) {
  return (
    <Card sx={{ pb: 3 }}>
      <DynamicNav tabs={infoPageTabs} twoRows />
      {children}
    </Card>
  );
}
