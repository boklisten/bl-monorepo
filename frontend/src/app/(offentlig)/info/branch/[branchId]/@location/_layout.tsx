import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box } from "@mui/material";
import { ReactNode } from "react";

export function BranchLocationLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", marginBottom: 2 }} data-testid="branch-address">
      <LocationOnIcon />
      {children}
    </Box>
  );
}
