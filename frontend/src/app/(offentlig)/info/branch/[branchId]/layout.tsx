import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function BranchPageLayout({
  children,
  location,
  openingHours,
}: {
  children: ReactNode;
  location: ReactNode;
  openingHours: ReactNode;
}) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {children}
      {location}
      {openingHours}
    </Box>
  );
}
