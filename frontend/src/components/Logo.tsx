import { Box, Typography } from "@mui/material";
import Image from "next/image";

import DynamicLink from "@/components/DynamicLink";
import TestVersionChip from "@/components/TestVersionChip";

export default function Logo({ variant }: { variant: "white" | "blue" }) {
  return (
    <DynamicLink underline={"none"} href={"/"}>
      <Box
        sx={{
          color: "secondary",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Image
          src={`/boklisten_logo_${variant}.png`}
          width={40}
          height={40}
          alt="Boklisten.no"
        />
        <Typography
          variant="h5"
          component="div"
          noWrap
          sx={{
            fontWeight: "bold",
            display: { xs: "none", md: "flex" },
            flexGrow: 1,
            marginLeft: 1,
            color: variant === "white" ? "white" : "#26768f",
          }}
        >
          Boklisten.no
        </Typography>
        <TestVersionChip />
      </Box>
    </DynamicLink>
  );
}
