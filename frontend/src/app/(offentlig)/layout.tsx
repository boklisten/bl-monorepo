import {
  Anchor,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
} from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";

import CartNavbarIndicator from "@/features/cart/CartNavbarIndicator";
import Logo from "@/features/layout/Logo";
import PublicNavigationDrawer from "@/features/layout/PublicNavigationDrawer";
import PublicPageFooter from "@/features/layout/PublicPageFooter";

export const metadata: Metadata = {
  title: {
    template: "%s | Boklisten.no",
    default: "Boklisten.no",
  },
};

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
              <Group gap={"xl"} visibleFrom={"sm"}>
                <CartNavbarIndicator />
                <Anchor c={"#fff"} component={Link} href={"/info/general"}>
                  Info
                </Anchor>
                <Anchor c={"#fff"} component={Link} href={"/bestilling"}>
                  Bestill bøker
                </Anchor>
              </Group>
              <PublicNavigationDrawer />
            </Group>
          </Group>
        </AppShellHeader>

        <AppShellMain
          // Keep the footer below the fold
          mih={"calc(100dvh - var(--app-shell-header-height))"}
        >
          {children}
        </AppShellMain>
      </AppShell>
      <PublicPageFooter />
    </>
  );
}
