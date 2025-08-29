import { Anchor, Group, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import TestVersionChip from "@/components/TestVersionChip";

export default function Logo({ variant }: { variant: "white" | "blue" }) {
  return (
    <Anchor component={Link} href={"/"} underline={"never"}>
      <Group gap={"xs"}>
        <Image
          src={`/boklisten_logo_${variant}.png`}
          width={40}
          height={40}
          alt="Boklisten.no"
        />
        <Title order={2} c={variant === "white" ? "#fff" : "#26768f"}>
          Boklisten.no
        </Title>
        <TestVersionChip />
      </Group>
    </Anchor>
  );
}
