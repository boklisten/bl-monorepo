import CopyrightIcon from "@mui/icons-material/Copyright";
import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import moment from "moment";
import Image from "next/image";

import DynamicLink from "@/components/DynamicLink";
import ContactInfo from "@/components/info/ContactInfo";

export default function Footer() {
  return (
    <footer>
      <Stack
        gap={1}
        direction="column"
        sx={{
          alignItems: "center",
          mt: 4,
          bgcolor: "#1e2e2c",
          color: "#fff",
          padding: 2,
        }}
      >
        <ContactInfo />
        <Image
          style={{ marginTop: 30 }}
          width={200}
          height={72}
          src="/DIBS_shop_vertical_EN_10.png"
          alt="Dibs easy logo"
        />
        <Box sx={{ mt: 7 }}>
          <DynamicLink href={"/info/policies/conditions"} color={"#fff"}>
            Betingelser
          </DynamicLink>
          {" | "}
          <DynamicLink href={"/info/policies/terms"} color={"#fff"}>
            Vilkår
          </DynamicLink>
          {" | "}
          <DynamicLink href={"/info/policies/privacy"} color={"#fff"}>
            Personvernserklæring
          </DynamicLink>
        </Box>
        <Typography>Organisasjonsnummer: 912047385 MVA</Typography>
        <Typography sx={{ display: "flex", gap: 0.8 }}>
          Boklisten.no AS
          <CopyrightIcon />
          {moment().format("YYYY")}
        </Typography>
      </Stack>
    </footer>
  );
}
