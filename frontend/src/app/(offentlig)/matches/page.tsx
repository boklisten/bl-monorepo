import Matches from "@frontend/components/matches/Matches";
import { Typography, Box } from "@mui/material";
import { Metadata } from "next";
import { Suspense } from "react";

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
