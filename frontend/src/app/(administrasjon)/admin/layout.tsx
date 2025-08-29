"use client";
import { USER_PERMISSION } from "@boklisten/backend/shared/user-permission";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
} from "@mantine/core";

import AdminPageHeader from "@/app/(administrasjon)/admin/AdminPageHeader";
import AdminPageNavigation from "@/app/(administrasjon)/admin/AdminPageNavigation";
import AuthGuard from "@/components/common/AuthGuard";

export default function AdminPageLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthGuard requiredPermission={USER_PERMISSION.EMPLOYEE}>
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
        <AppShellMain>{children}</AppShellMain>
      </AppShell>
    </AuthGuard>
  );
}
