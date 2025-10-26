import { Group, Stack, Text } from "@mantine/core";
import { IconCopyright } from "@tabler/icons-react";
import dayjs from "dayjs";
import Image from "next/image";

import ContactInfo from "@/shared/components/ContactInfo";
import NextAnchor from "@/shared/components/NextAnchor";

export default async function PublicPageFooter() {
  "use cache";
  return (
    <Stack
      bg={"#1e2e2c"}
      c={"#fff"}
      align={"center"}
      mt={"xl"}
      p={"md"}
      component={"footer"}
    >
      <ContactInfo />
      <Image
        style={{ marginTop: 30 }}
        width={200}
        height={72}
        src="/DIBS_shop_vertical_EN_10.png"
        alt="Dibs easy logo"
      />
      <Group mt={50}>
        <NextAnchor href={"/info/policies/conditions"}>Betingelser</NextAnchor>
        {" | "}
        <NextAnchor href={"/info/policies/terms"}>Vilkår</NextAnchor>
        {" | "}
        <NextAnchor href={"/info/policies/privacy"}>
          Personvernserklæring
        </NextAnchor>
      </Group>
      <Text>Organisasjonsnummer: 912047385 MVA</Text>
      <Group gap={"xs"}>
        <Text>Boklisten.no AS</Text>
        <IconCopyright />
        {dayjs().format("YYYY")}
      </Group>
    </Stack>
  );
}
