import DynamicNav from "@frontend/components/info/DynamicNav";
import { infoPageTabs } from "@frontend/utils/constants";
import { Card } from "@mui/material";
import { ReactNode } from "react";

export default function InfoPageLayout({ children }: { children: ReactNode }) {
  return (
    <Card sx={{ pb: 3 }}>
      <DynamicNav tabs={infoPageTabs} twoRows />
      {children}
    </Card>
  );
}
