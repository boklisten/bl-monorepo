"use client";

import { Box, Burger, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import AdminPageNavigation from "@/app/(administrasjon)/admin/AdminPageNavigation";

export default function AdminPageNavigationDrawer() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <Box className={"flex xs:hidden"}>
      <Burger color={"white"} opened={opened} onClick={toggle} />

      <Drawer
        opened={opened}
        onClose={close}
        onClick={close}
        position={"right"}
        title={"Velg side"}
      >
        <AdminPageNavigation />
      </Drawer>
    </Box>
  );
}
