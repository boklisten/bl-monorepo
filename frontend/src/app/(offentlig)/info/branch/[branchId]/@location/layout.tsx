import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box } from "@mui/material";

export default function BranchLocationLayout({
  children,
}: LayoutProps<"/info/branch/[branchId]">) {
  return (
    <Box sx={{ display: "flex", marginBottom: 2 }}>
      <LocationOnIcon />
      {children}
    </Box>
  );
}
