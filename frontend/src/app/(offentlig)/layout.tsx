import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core";
import { Metadata } from "next";

import PublicPageFooter from "@/shared/layout/PublicPageFooter";
import PublicPageHeader from "@/shared/layout/PublicPageHeader";

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
          <PublicPageHeader />
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
