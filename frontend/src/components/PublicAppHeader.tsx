"use client";
import { Anchor, AppShellHeader, Group, useMantineTheme } from "@mantine/core";
import Link from "next/link";

import Logo from "@/components/Logo";
import DropDownMenu from "@/components/SideMenuDrawer";

export default function PublicAppHeader() {
  const theme = useMantineTheme();
  return (
    <AppShellHeader bg={theme.primaryColor}>
      <Group h={"100%"} justify={"space-between"} align={"center"} px={"md"}>
        <Logo variant={"white"} />
        <Group>
          <Group gap={"xl"} className={"hidden sm:flex"}>
            <Anchor c={"#fff"} component={Link} href={"/info/general"}>
              Info
            </Anchor>
            <Anchor c={"#fff"} component={Link} href={"/order"}>
              Bestill bøker
            </Anchor>
          </Group>
          <DropDownMenu />
        </Group>
      </Group>
    </AppShellHeader>
  );
}
