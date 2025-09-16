import { Group } from "@mantine/core";

import AdminPageNavigationDrawer from "@/shared/components/AdminPageNavigationDrawer";
import Logo from "@/shared/components/Logo";

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
