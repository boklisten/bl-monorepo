import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  MantineSpacing,
  StyleProp,
} from "@mantine/core";
import { PropsWithChildren } from "react";

import CartNavbarIndicator from "@/features/cart/CartNavbarIndicator";
import Logo from "@/features/layout/Logo";
import PublicNavigationDrawer from "@/features/layout/PublicNavigationDrawer";
import PublicPageFooter from "@/features/layout/PublicPageFooter";
import NextAnchor from "@/shared/components/NextAnchor";

export default function AppLayout({
  children,
  padding,
  withBorder,
}: PropsWithChildren<{
  padding: StyleProp<MantineSpacing>;
  withBorder: boolean;
}>) {
  return (
    <>
      <AppShell header={{ height: 65 }} p={padding}>
        <AppShellHeader bg={"brand"} withBorder={withBorder}>
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
