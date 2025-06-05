import { Typography, Box } from "@mui/material";
import { Metadata } from "next";

import OpenOrdersList from "@/components/orders/OpenOrdersList";

export const metadata: Metadata = {
  title: "Mine bestillinger",
  description: "Bøker som du har bestilt",
};

export default function OpenOrdersPage() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h1"
        sx={{
          mb: 2,
        }}
      >
        Mine bestillinger
      </Typography>
      <OpenOrdersList />
    </Box>
  );
}
