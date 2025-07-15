import { Box, Typography } from "@mui/material";
import { Metadata } from "next";

import BranchSelect from "@/components/BranchSelect";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

export default function BranchPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 2,
      }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
        Velg din skole
      </Typography>
      <BranchSelect />
    </Box>
  );
}
