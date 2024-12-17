import BranchSelect from "@frontend/components/BranchSelect";
import DynamicLink from "@frontend/components/DynamicLink";
import DropDownMenu from "@frontend/components/SideMenuDrawer";
import { Button, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Image from "next/image";

interface TabLinkProps {
  title: string;
  href: string;
  testID: string;
}

const TabLink = ({ title, href, testID }: TabLinkProps) => {
  return (
    <DynamicLink href={href}>
      <Button
        data-testid={testID}
        sx={{
          display: { xs: "none", md: "flex" },
          color: "white",
          alignItems: "center",
          cursor: "pointer",
        }}
        color="secondary"
      >
        {title}
      </Button>
    </DynamicLink>
  );
};

const TAB_LINKS: TabLinkProps[] = [
  {
    href: "/info/general",
    title: "Info",
    testID: "infoBtnNav",
  },
  {
    href: "/order",
    title: "Bestill bøker",
    testID: "",
  },
];

export default function NavBar() {
  return (
    <Box data-testid="nav-bar">
      <AppBar position="fixed">
        <Toolbar sx={{ paddingY: "10px" }}>
          <DynamicLink href={"/"}>
            <Box
              sx={{
                color: "secondary",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Image
                src="/boklisten_logo_v2_icon_white_lg.png"
                width={40}
                height={40}
                alt="logo"
              />
              <Typography
                variant="h5"
                component="div"
                noWrap
                sx={{
                  display: { xs: "none", md: "flex" },
                  flexGrow: 1,
                  marginLeft: 1,
                  color: "white",
                }}
              >
                Boklisten.no
              </Typography>
            </Box>
          </DynamicLink>

          <Box sx={{ flexGrow: 1 }} />

          {TAB_LINKS.map((tabLink) => (
            <TabLink
              key={tabLink.href}
              title={tabLink.title}
              href={tabLink.href}
              testID={tabLink.testID}
            />
          ))}

          <BranchSelect isNav />

          <DropDownMenu />
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ display: "inline-block" }} />
    </Box>
  );
}
