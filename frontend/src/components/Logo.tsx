import { Anchor, Group, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import TestVersionChip from "@/components/TestVersionChip";

export default function Logo({
  variant,
  admin,
}: {
  variant: "white" | "blue";
  admin?: boolean;
}) {
  return (
    <Anchor component={Link} href={admin ? "/admin" : "/"} underline={"never"}>
      <Group gap={"xs"} wrap={"nowrap"}>
        <Image
          src={`/boklisten_logo_${variant}.png`}
          width={40}
          height={40}
          alt="Boklisten.no"
        />
        <Title
          style={{ fontFamily: "serif" }}
          order={2}
          c={variant === "white" ? "#fff" : "#26768f"}
        >
          Boklisten.no
          {admin && (
            <Text
              span
              inherit
              variant={"gradient"}
              gradient={{ from: "yellow", to: "orange" }}
            >
              /admin
            </Text>
          )}
        </Title>
        <TestVersionChip />
      </Group>
    </Anchor>
  );
}
