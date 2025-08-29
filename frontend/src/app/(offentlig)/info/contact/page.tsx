import { Title } from "@mantine/core";
import { Metadata } from "next";

import ContactInfo from "@/components/info/ContactInfo";

export const metadata: Metadata = {
  title: "Kontakt oss",
  description:
    "Vi er tilgjengelig for spørsmål og henvendelser både på e-post og telefon. Se vår kontaktinformasjon, med e-post-adresse, telefonnummer og gateadresse.",
};

export default function ContactPage() {
  return (
    <>
      <Title ta={"center"} order={2}>
        Kontakt oss
      </Title>
      <ContactInfo />
    </>
  );
}
