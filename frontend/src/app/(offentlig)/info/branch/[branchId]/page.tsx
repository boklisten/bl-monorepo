import { Box, Typography } from "@mui/material";
import { Metadata } from "next";

import BranchSelect from "@/components/BranchSelect";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

export default async function BranchPage() {
  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", marginTop: 4 }}>
        Åpningstider
      </Typography>
      <Box sx={{ my: 3.5 }}>
        <BranchSelect />
      </Box>
    </>
  );
}
