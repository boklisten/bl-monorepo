import {
  Anchor,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
} from "@mantine/core";
import Link from "next/link";

import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import PublicNavigationDrawer from "@/components/PublicNavigationDrawer";

export default function PublicPageLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell header={{ height: 65 }} p={"md"}>
        <AppShellHeader bg={"brand"}>
          <Group
            h={"100%"}
            justify={"space-between"}
            align={"center"}
            px={"md"}
          >
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
        </AppShellHeader>
        <AppShellMain
          style={{
            // Keep the footer below the fold
            minHeight: "calc(100dvh - var(--app-shell-header-height))",
          }}
        >
          {children}
        </AppShellMain>
      </AppShell>
      <Footer />
    </>
  );
}
