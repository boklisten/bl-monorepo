"use client";
import {
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { usePathname, useRouter } from "next/navigation";
import stringSimilarity from "string-similarity";

import DynamicLink from "@/components/DynamicLink";

export interface LinkTabProps {
  label: string;
  href: `/${string}`;
}

function MobileTabSelect({
  tabs,
  activeTabIndex,
}: {
  tabs: LinkTabProps[];
  activeTabIndex: number;
}) {
  const router = useRouter();
  return (
    <FormControl fullWidth sx={{ width: 230 }}>
      <InputLabel>Velg side</InputLabel>
      <Select
        label={"Velg side"}
        value={tabs[activeTabIndex]?.href ?? ""}
        onChange={(event) => {
          router.push(event.target.value);
        }}
      >
        {tabs.map((tab) => (
          <MenuItem key={tab.href} value={tab.href}>
            {tab.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function LinkTab({ label, href }: LinkTabProps) {
  return (
    <DynamicLink href={href} style={{ color: "inherit" }}>
      <Tab label={label} />
    </DynamicLink>
  );
}

const DynamicNav = ({
  tabs,
  twoRows,
}: {
  tabs: LinkTabProps[];
  twoRows?: boolean;
}) => {
  const pathName = usePathname();
  const activeTabIndex = stringSimilarity.findBestMatch(
    pathName,
    tabs.map((tab) => tab.href),
  ).bestMatchIndex;

  const rowOneIndex = activeTabIndex < 4 ? activeTabIndex : false;
  const rowTwoIndex = activeTabIndex >= 4 ? activeTabIndex - 4 : false;

  return (
    <Grid container sx={{ my: 3, justifyContent: "center" }}>
      <Box
        sx={{
          display: { xs: "none", sm: "none", lg: "flex" },
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {twoRows && (
          <>
            <Tabs value={rowOneIndex} aria-label="dynamic tabs row 1">
              {tabs.slice(0, 4).map((tab) => (
                <LinkTab key={tab.href} label={tab.label} href={tab.href} />
              ))}
            </Tabs>
            <Tabs value={rowTwoIndex} aria-label="dynamic tabs row 2">
              {tabs.slice(4).map((tab) => (
                <LinkTab key={tab.href} label={tab.label} href={tab.href} />
              ))}
            </Tabs>
          </>
        )}
        {!twoRows && (
          <Tabs value={activeTabIndex} aria-label="dynamic tabs">
            {tabs.map((tab) => (
              <LinkTab key={tab.href} label={tab.label} href={tab.href} />
            ))}
          </Tabs>
        )}
        <Divider variant="middle" style={{ width: "95%" }} />
      </Box>
      <Box
        sx={{
          display: { sm: "flex", lg: "none" },
        }}
      >
        <MobileTabSelect tabs={tabs} activeTabIndex={activeTabIndex} />
      </Box>
    </Grid>
  );
};

export default DynamicNav;
