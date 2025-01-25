import { Typography } from "@mui/material";
import { Metadata } from "next";

import ContactInfo from "@/components/info/ContactInfo";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description:
    "Vi er tilgjengelig for spørsmål og henvendelser både på epost og telefon. Se vår kontaktinformasjon, med epost-adresse, telefonnummer og gateadresse.",
};

const ContactPage = () => {
  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
        Kontakt oss
      </Typography>
      <ContactInfo />
    </>
  );
};

export default ContactPage;
