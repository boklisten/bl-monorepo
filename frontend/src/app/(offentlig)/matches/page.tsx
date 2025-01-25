import { Typography, Box } from "@mui/material";
import { Metadata } from "next";
import { Suspense } from "react";

import Matches from "@/components/matches/Matches";

export const metadata: Metadata = {
  title: "Mine overleveringer",
  description: "Overleveringer av bøker",
};

export default function MatchesPage() {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h1"
        sx={{
          mb: 2,
        }}
      >
        Mine overleveringer
      </Typography>
      <Suspense>
        <Matches />
      </Suspense>
    </Box>
  );
}
