"use client";
import DynamicLink from "@frontend/components/DynamicLink";
import {
  Divider,
  FormControl,
  InputLabel,
  NativeSelect,
  SelectChangeEvent,
} from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { usePathname, useRouter } from "next/navigation";
import stringSimilarity from "string-similarity";

export interface LinkTabProps {
  label: string;
  href: string;
}

function SelectTab({
  tabs,
  activeTabIndex,
}: {
  tabs: LinkTabProps[];
  activeTabIndex: number;
}) {
  const router = useRouter();

  const handleChange = (event: SelectChangeEvent) => {
    router.push(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120, marginX: 10, marginY: 3 }}>
      <FormControl fullWidth>
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          Velg side
        </InputLabel>
        <NativeSelect
          data-testid="select-info-page"
          value={tabs[activeTabIndex]?.href}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={handleChange as any}
          inputProps={{
            name: "page",
            id: "uncontrolled-native",
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.href} value={tab.href}>
              {tab.label}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
    </Box>
  );
}

function LinkTab({ label, href }: LinkTabProps) {
  return (
    <DynamicLink href={href} style={{ color: "inherit" }}>
      <Tab data-testid="link-tab" label={label} />
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

  // A hack to be able to use two rows of tabs
  const rowOneIndex = activeTabIndex < 4 ? activeTabIndex + 1 : 0;
  const rowTwoIndex = activeTabIndex >= 4 ? activeTabIndex - 3 : 0;

  return (
    <>
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
              <Tab label={"Hidden"} sx={{ display: "none" }} />
              {tabs.slice(0, 4).map((tab) => (
                <LinkTab key={tab.href} label={tab.label} href={tab.href} />
              ))}
            </Tabs>
            <Tabs value={rowTwoIndex} aria-label="dynamic tabs row 2">
              <Tab label={"Hidden"} sx={{ display: "none" }} />
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
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <SelectTab tabs={tabs} activeTabIndex={activeTabIndex} />
      </Box>
    </>
  );
};

export default DynamicNav;
