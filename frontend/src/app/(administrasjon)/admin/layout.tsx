"use client";
import { getUserPermission } from "@frontend/api/auth";
import PagePermissionGuard from "@frontend/components/PagePermissionGuard";
import { getAdminPagesNavigationLinks } from "@frontend/utils/adminNavigation";
import theme from "@frontend/utils/theme";
import { DashboardLayout, Navigation, PageContainer } from "@toolpad/core";
import { AppProvider } from "@toolpad/core/nextjs";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [navLinks, setNavLinks] = useState<Navigation>([]);
  useEffect(() => {
    const userPermission = getUserPermission();
    setNavLinks(getAdminPagesNavigationLinks(userPermission));
  }, []);
  return (
    <AppProvider
      navigation={navLinks}
      theme={theme}
      branding={{
        title: "bl-admin",
        logo: (
          <Image
            src="/boklisten_logo_white.png"
            width={40}
            height={40}
            alt="logo"
          />
        ),
        homeUrl: "/admin/start",
      }}
    >
      <DashboardLayout>
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
      <PagePermissionGuard requiredPermission={"employee"} />
    </AppProvider>
  );
}
