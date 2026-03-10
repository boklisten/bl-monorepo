import { Title } from "@mantine/core";
import ContactInfo from "@/shared/components/ContactInfo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/contact")({
  head: () => ({
    meta: [
      { title: "Kontakt oss | Boklisten.no" },
      {
        description:
          "Vi er tilgjengelig for spørsmål og henvendelser både på e-post og telefon. Se vår kontaktinformasjon, med e-post-adresse, telefonnummer og gateadresse.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <Title ta={"center"} order={2}>
        Kontakt oss
      </Title>
      <ContactInfo />
    </>
  );
}
