"use client";
import { Typography } from "@mui/material";
import { Navigation } from "@toolpad/core";
import { useEffect, useState } from "react";

import AdminNavigationCards from "@/components/AdminNavigationCards";
import { getAdminPagesNavigationLinks } from "@/utils/adminNavigation";
import useAuth from "@/utils/useAuth";

export default function AdminStartPage() {
  const [navLinks, setNavLinks] = useState<Navigation>([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setNavLinks(getAdminPagesNavigationLinks(isAdmin));
  }, [isAdmin]);

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
