import { Box } from "@mui/material";

export default function BranchPageLayout({
  children,
  location,
  openingHours,
}: LayoutProps<"/info/branch/[branchId]">) {
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
