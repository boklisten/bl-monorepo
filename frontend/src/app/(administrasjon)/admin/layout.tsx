"use client";
import { Typography } from "@mui/material";
import { DashboardLayout, Navigation, PageContainer } from "@toolpad/core";
import { NextAppProvider } from "@toolpad/core/nextjs";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

import { getUserPermission } from "@/api/auth";
import PagePermissionGuard from "@/components/PagePermissionGuard";
import TestVersionChip from "@/components/TestVersionChip";
import { getAdminPagesNavigationLinks } from "@/utils/adminNavigation";
import theme from "@/utils/theme";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [navLinks, setNavLinks] = useState<Navigation>([]);
  useEffect(() => {
    const userPermission = getUserPermission();
    setNavLinks(getAdminPagesNavigationLinks(userPermission));
  }, []);
  return (
    <NextAppProvider
      navigation={navLinks}
      theme={theme}
      branding={{
        title: "",
        logo: (
          <>
            <Image
              src="/boklisten_logo_white.png"
              width={40}
              height={40}
              alt="logo"
            />
            <Typography
              variant="h5"
              component="div"
              noWrap
              sx={{
                fontWeight: "bold",
                display: { xs: "none", md: "flex" },
                flexGrow: 1,
                marginLeft: 1,
              }}
            >
              bl-admin
            </Typography>
            <TestVersionChip />
          </>
        ),
        homeUrl: "/admin",
      }}
    >
      <DashboardLayout>
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
      <PagePermissionGuard requiredPermission={"employee"} />
    </NextAppProvider>
  );
}
