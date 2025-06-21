import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function BranchLocationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", marginBottom: 2 }}>
      <LocationOnIcon />
      {children}
    </Box>
  );
}
