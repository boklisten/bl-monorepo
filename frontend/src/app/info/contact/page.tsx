import { Card, Typography } from "@mui/material";
import { Metadata } from "next";

import ContactInfo from "@/components/info/ContactInfo";
import DynamicNav from "@/components/info/DynamicNav";
import { infoPageTabs } from "@/utils/constants";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description:
    "Vi er tilgjengelig for spørsmål og henvendelser både på epost og telefon. Se vår kontaktinformasjon, med epost-adresse, telefonnummer og gateadresse.",
};

const ContactPage = () => {
  return (
    <>
      <Card sx={{ paddingBottom: 4 }}>
        <DynamicNav tabs={infoPageTabs} twoRows />
        <Typography
          variant="h4"
          sx={{ textAlign: "center", marginTop: 4, marginBottom: 2 }}
        >
          Kontakt oss
        </Typography>
        <ContactInfo />
      </Card>
    </>
  );
};

export default ContactPage;
