import { Box, Typography } from "@mui/material";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import CustomerItemsOverview from "@/components/items/CustomerItemsOverview";

export const metadata: Metadata = {
  title: "Dine bøker",
  description: "Se og administrer dine nåværende, bestilte og tidligere bøker",
};

export default function YourItemsPage() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h1"
        sx={{
          mb: 2,
        }}
      >
        Dine bøker
      </Typography>
      <AuthGuard>
        <CustomerItemsOverview />
      </AuthGuard>
    </Box>
  );
}
