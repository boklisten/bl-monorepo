import { Group, Title } from "@mantine/core";
import Image from "next/image";

import TestVersionChip from "@/features/layout/TestVersionChip";
import NextAnchor from "@/shared/components/NextAnchor";

export default function Logo({
  variant,
  admin,
}: {
  variant: "white" | "blue";
  admin?: boolean;
}) {
  return (
    <NextAnchor href={admin ? "/admin" : "/"} underline={"never"}>
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
          textWrap={"nowrap"}
        >
          {admin ? "bl-admin" : "Boklisten.no"}
        </Title>
        <TestVersionChip />
      </Group>
    </NextAnchor>
  );
}
