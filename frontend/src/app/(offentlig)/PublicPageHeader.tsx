import { Anchor, Group } from "@mantine/core";
import Link from "next/link";

import Logo from "@/components/Logo";
import PublicNavigationDrawer from "@/components/PublicNavigationDrawer";

export default function PublicPageHeader() {
  return (
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
        <PublicNavigationDrawer />
      </Group>
    </Group>
  );
}
