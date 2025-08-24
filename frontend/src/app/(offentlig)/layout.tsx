import { AppShell, AppShellMain } from "@mantine/core";

import Footer from "@/components/Footer";
import PublicAppHeader from "@/components/PublicAppHeader";

export default function PublicPageLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell header={{ height: 65 }} p={"md"}>
        <PublicAppHeader />
        <AppShellMain
          style={{
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
