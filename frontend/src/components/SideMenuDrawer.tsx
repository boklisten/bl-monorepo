"use client";
import {
  AdminPanelSettings,
  Handshake,
  PendingActions,
  Search,
} from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookIcon from "@mui/icons-material/Book";
import EmailIcon from "@mui/icons-material/Email";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import { Badge, IconButton, ListItemButton } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useQuery } from "@tanstack/react-query";
import { useState, KeyboardEvent, MouseEvent, ReactNode } from "react";

import { getAccessTokenBody } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import useApiClient from "@/utils/api/useApiClient";
import useAuth from "@/utils/useAuth";

interface DrawerLinkProps {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: ReactNode;
  onClick?: () => void;
}

const DrawerLink = ({ title, href, icon, onClick, badge }: DrawerLinkProps) => (
  <DynamicLink href={href} underline={"none"} style={{ color: "inherit" }}>
    <ListItemButton onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
      {badge}
    </ListItemButton>
  </DynamicLink>
);

export default function SideMenuDrawer() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, isEmployee } = useAuth();
  const client = useApiClient();

  const {
    data: userDetail,
    isLoading: isLoadingUserDetail,
    isError: isErrorUserDetail,
  } = useQuery({
    queryKey: [client.v2.user_details.$url()],
    queryFn: () => {
      const { details } = getAccessTokenBody();
      if (!details) return null;
      return client.v2.user_details({ detailsId: details }).$get().unwrap();
    },
  });

  const toggleDrawer =
    (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as KeyboardEvent).key === "Tab" ||
          (event as KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setOpen(open);
    };
  const taskCount =
    isLoadingUserDetail || isErrorUserDetail || !userDetail?.tasks
      ? 0
      : (userDetail.tasks.confirmDetails ? 1 : 0) +
        (userDetail.tasks.signAgreement ? 1 : 0);
  return (
    <>
      <IconButton sx={{ color: "white" }} onClick={toggleDrawer(true)}>
        <Badge
          badgeContent={taskCount}
          color={"error"}
          invisible={taskCount === 0}
        >
          <MenuIcon />
        </Badge>
      </IconButton>
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {taskCount > 0 && (
              <>
                <DrawerLink
                  title={"Dine oppgaver"}
                  href={"/oppgaver"}
                  icon={<PendingActions />}
                  badge={
                    <Badge
                      sx={{ right: 40 }}
                      badgeContent={taskCount}
                      color={"error"}
                    />
                  }
                />
                <Divider />
              </>
            )}
            <DrawerLink
              title={"Bestill bøker"}
              href={"/order"}
              icon={<BookIcon />}
            />

            {isLoggedIn && (
              <>
                <DrawerLink
                  title={"Dine bøker"}
                  href={"/items"}
                  icon={<MenuBookIcon />}
                />
                <DrawerLink
                  title={"Ordrehistorikk"}
                  href={"/order-history"}
                  icon={<ReceiptIcon />}
                />
                <DrawerLink
                  title={"Dine overleveringer"}
                  href={"/overleveringer"}
                  icon={<Handshake />}
                />
                <DrawerLink
                  title={"Boksøk"}
                  href={"/sjekk"}
                  icon={<Search />}
                />
              </>
            )}
            <Divider />

            <DrawerLink
              title={"Åpningstider"}
              href={"/info/branch"}
              icon={<AccessTimeIcon />}
            />
            <DrawerLink
              title={"Generell informasjon"}
              href={"/info/general"}
              icon={<InfoIcon />}
            />
            <DrawerLink
              title={"Kontaktinformasjon"}
              href={"/info/contact"}
              icon={<EmailIcon />}
            />

            <Divider />

            {isLoggedIn && (
              <>
                <DrawerLink
                  title={"Brukerinnstillinger"}
                  href={"/user-settings"}
                  icon={<SettingsIcon />}
                />
                <DrawerLink
                  title={"Logg ut"}
                  href={"/auth/logout"}
                  icon={<LogoutIcon />}
                />
                {isEmployee && (
                  <>
                    <Divider />
                    <DrawerLink
                      title={"Gå til bl-admin"}
                      href={"/admin"}
                      icon={<AdminPanelSettings color={"primary"} />}
                    />
                  </>
                )}
              </>
            )}

            {!isLoggedIn && (
              <>
                <DrawerLink
                  title={"Registrer"}
                  href={"/auth/register"}
                  icon={<PersonAddIcon />}
                />
                <DrawerLink
                  title={"Logg inn"}
                  href={"/auth/login"}
                  icon={<LoginIcon />}
                />
              </>
            )}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
}
