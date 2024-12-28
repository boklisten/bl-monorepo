"use client";
import { getUserPermission } from "@frontend/api/auth";
import AdminNavigationCards from "@frontend/components/AdminNavigationCards";
import { getAdminPagesNavigationLinks } from "@frontend/utils/adminNavigation";
import { Typography } from "@mui/material";
import { Navigation, PageContainer } from "@toolpad/core";
import { useEffect, useState } from "react";

export default function AdminStartPage() {
  const [navLinks, setNavLinks] = useState<Navigation>([]);
  useEffect(() => {
    const userPermission = getUserPermission();
    setNavLinks(getAdminPagesNavigationLinks(userPermission));
  }, []);
  return (
    <PageContainer>
      <Typography variant="h2" sx={{ textAlign: "center", mb: 5 }}>
        Velkommen til <b>bl-admin</b>, Boklisten sitt administrasjonssystem for
        bøker!
      </Typography>
      <AdminNavigationCards
        navLinks={navLinks}
        label={"Trykk på et verktøy for å komme i gang!"}
      />
    </PageContainer>
  );
}