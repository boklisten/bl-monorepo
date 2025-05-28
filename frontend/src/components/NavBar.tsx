import { Button } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import DynamicLink from "@/components/DynamicLink";
import Logo from "@/components/Logo";
import DropDownMenu from "@/components/SideMenuDrawer";

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
          <Logo variant={"white"} />

          <Box sx={{ flexGrow: 1 }} />

          {TAB_LINKS.map((tabLink) => (
            <TabLink
              key={tabLink.href}
              title={tabLink.title}
              href={tabLink.href}
              testID={tabLink.testID}
            />
          ))}

          <DropDownMenu />
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ display: "inline-block" }} />
    </Box>
  );
}
