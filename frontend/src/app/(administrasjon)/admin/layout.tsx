import { USER_PERMISSION } from "@boklisten/backend/shared/user-permission";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
} from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import AdminPageHeader from "@/shared/components/AdminPageHeader";
import AdminPageNavigation from "@/shared/components/AdminPageNavigation";

export const metadata: Metadata = {
  title: {
    template: "%s | bl-admin",
    default: "bl-admin",
  },
};

export default function AdminPageLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell
      header={{ height: 65 }}
      navbar={{ breakpoint: "xs", width: 200, collapsed: { mobile: true } }}
      padding={"md"}
    >
      <AppShellHeader bg={"brand"}>
        <AdminPageHeader />
      </AppShellHeader>
      <AppShellNavbar>
        <AdminPageNavigation />
      </AppShellNavbar>
      <AppShellMain>
        <AuthGuard requiredPermission={USER_PERMISSION.EMPLOYEE}>
          {children}
        </AuthGuard>
      </AppShellMain>
    </AppShell>
  );
}
