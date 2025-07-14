import { Typography, Box } from "@mui/material";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import { MatchesList } from "@/components/matches/matchesList/MatchesList";

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
      <AuthGuard>
        <MatchesList />
      </AuthGuard>
    </Box>
  );
}
