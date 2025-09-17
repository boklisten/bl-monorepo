import { Anchor, Group, Stack, Text } from "@mantine/core";
import { IconCopyright } from "@tabler/icons-react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import ContactInfo from "@/shared/components/ContactInfo";

export default function PublicPageFooter() {
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
        <Anchor component={Link} href={"/info/policies/conditions"}>
          Betingelser
        </Anchor>
        {" | "}
        <Anchor component={Link} href={"/info/policies/terms"}>
          Vilkår
        </Anchor>
        {" | "}
        <Anchor component={Link} href={"/info/policies/privacy"}>
          Personvernserklæring
        </Anchor>
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
