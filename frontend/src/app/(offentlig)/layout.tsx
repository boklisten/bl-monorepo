import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core";

import PublicPageFooter from "@/app/(offentlig)/PublicPageFooter";
import PublicPageHeader from "@/app/(offentlig)/PublicPageHeader";

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
