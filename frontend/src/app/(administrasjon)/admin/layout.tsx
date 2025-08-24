"use client";
import { USER_PERMISSION } from "@boklisten/backend/shared/user-permission";
import { Typography } from "@mui/material";
import { DashboardLayout, Navigation, PageContainer } from "@toolpad/core";
import { NextAppProvider } from "@toolpad/core/nextjs";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

import AuthGuard from "@/components/common/AuthGuard";
import TestVersionChip from "@/components/TestVersionChip";
import { getAdminPagesNavigationLinks } from "@/utils/adminNavigation";
import muiTheme from "@/utils/muiTheme";
import useAuth from "@/utils/useAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [navLinks, setNavLinks] = useState<Navigation>([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setNavLinks(getAdminPagesNavigationLinks(isAdmin));
  }, [isAdmin]);

  return (
    <AuthGuard requiredPermission={USER_PERMISSION.EMPLOYEE}>
      <NextAppProvider
        navigation={navLinks}
        theme={muiTheme}
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
      </NextAppProvider>
    </AuthGuard>
  );
}
