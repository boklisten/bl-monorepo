import { AppShell, AppShellHeader, AppShellMain, Group } from "@mantine/core";
import { Metadata } from "next";

import CartNavbarIndicator from "@/features/cart/CartNavbarIndicator";
import Logo from "@/features/layout/Logo";
import PublicNavigationDrawer from "@/features/layout/PublicNavigationDrawer";
import PublicPageFooter from "@/features/layout/PublicPageFooter";
import NextAnchor from "@/shared/components/NextAnchor";

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
                <NextAnchor c={"#fff"} href={"/info/general"}>
                  Info
                </NextAnchor>
                <NextAnchor c={"#fff"} href={"/bestilling"}>
                  Bestill bøker
                </NextAnchor>
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
