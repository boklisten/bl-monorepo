"use client";
import { Typography } from "@mui/material";
import { Navigation } from "@toolpad/core";
import { useEffect, useState } from "react";

import { getUserPermission } from "@/api/auth";
import AdminNavigationCards from "@/components/AdminNavigationCards";
import { getAdminPagesNavigationLinks } from "@/utils/adminNavigation";

export default function AdminStartPage() {
  const [navLinks, setNavLinks] = useState<Navigation>([]);
  useEffect(() => {
    const userPermission = getUserPermission();
    setNavLinks(getAdminPagesNavigationLinks(userPermission));
  }, []);
  return (
    <>
      <Typography variant="h2" sx={{ textAlign: "center", mb: 5 }}>
        Velkommen til <b>bl-admin</b>, Boklisten sitt administrasjonssystem for
        bøker!
      </Typography>
      <AdminNavigationCards
        navLinks={navLinks}
        label={"Trykk på et verktøy for å komme i gang!"}
      />
    </>
  );
}
