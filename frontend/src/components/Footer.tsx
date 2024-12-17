import DynamicLink from "@frontend/components/DynamicLink";
import ContactInfo from "@frontend/components/info/ContactInfo";
import CopyrightIcon from "@mui/icons-material/Copyright";
import { Card, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import moment from "moment";
import Image from "next/image";

export default function Footer() {
  return (
    <Card
      data-testid="footer"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
      }}
    >
      <ContactInfo />
      <Box sx={{ marginBottom: 1.4 }}>
        <DynamicLink href={"/info/policies/conditions"}>
          Betingelser
        </DynamicLink>
        {" | "}
        <DynamicLink href={"/info/policies/terms"}>Vilkår</DynamicLink>
        {" | "}
        <DynamicLink href={"/info/policies/privacy"}>
          Personvernserklæring
        </DynamicLink>
      </Box>
      <Image
        width={200}
        height={72}
        src="/DIBS_shop_vertical_EN_10.png"
        alt="Dibs easy logo"
      />
      <Typography sx={{ marginTop: 1.4 }}>
        Organisasjonsnummer: 912047385 MVA
      </Typography>
      <Typography sx={{ display: "flex", gap: 0.8 }}>
        Boklisten.no AS
        <CopyrightIcon />
        {moment().format("YYYY")}
      </Typography>
    </Card>
  );
}
