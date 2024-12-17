import Matches from "@frontend/components/matches/Matches";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
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
