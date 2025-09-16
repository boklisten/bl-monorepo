import { Group } from "@mantine/core";

import AdminPageNavigationDrawer from "@/shared/layout/AdminPageNavigationDrawer";
import Logo from "@/shared/layout/Logo";

export default function AdminPageHeader() {
  return (
    <Group
      h={"100%"}
      justify={"space-between"}
      align={"center"}
      px={"md"}
      wrap={"nowrap"}
    >
      <Logo variant={"white"} admin />
      <AdminPageNavigationDrawer />
    </Group>
  );
}
