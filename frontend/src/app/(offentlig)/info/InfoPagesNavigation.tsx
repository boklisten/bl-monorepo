"use client";
import { Center, Tabs, TabsList, TabsTab, Select, Box } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import stringSimilarity from "string-similarity";

import DynamicLink from "@/components/DynamicLink";

interface LinkTab {
  label: string;
  value: `/${string}`;
}

const tabs = [
  { label: "Generell informasjon", value: "/info/general" },
  { label: "Spørsmål og svar", value: "/info/faq" },
  { label: "For VGS-elever", value: "/info/pupils" },
  { label: "Skoler og åpningstider", value: "/info/branch" },
  {
    label: "Avtaler og betingelser",
    value: "/info/policies/conditions",
  },
  { label: "Om oss", value: "/info/about" },
  { label: "For skolekunder", value: "/info/companies" },
  { label: "Innkjøpsliste", value: "/info/buyback" },
  { label: "Kontakt oss", value: "/info/contact" },
] as const satisfies LinkTab[];

function LinkTab({ label, value }: LinkTab) {
  return (
    <DynamicLink href={value} style={{ color: "inherit" }} underline="none">
      <TabsTab value={value}>{label}</TabsTab>
    </DynamicLink>
  );
}

const InfoPagesNavigation = () => {
  const router = useRouter();
  const pathName = usePathname();
  const activeTabIndex = stringSimilarity.findBestMatch(
    pathName,
    tabs.map((tab) => tab.value),
  ).bestMatchIndex;

  return (
    <Center>
      <Box className="hidden sm:flex">
        <Tabs defaultValue={tabs[activeTabIndex]?.value ?? ""}>
          <TabsList>
            {tabs.slice(0, 4).map((tab) => (
              <LinkTab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </TabsList>
          <TabsList>
            {tabs.slice(4).map((tab) => (
              <LinkTab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </TabsList>
        </Tabs>
      </Box>
      <Box className="flex sm:hidden">
        <Select
          aria-autocomplete={"none"}
          data={tabs}
          label={"Velg side"}
          value={tabs[activeTabIndex]?.value ?? ""}
          onChange={(href) => {
            // @ts-expect-error fixme: bad routing types
            router.push(href);
          }}
        ></Select>
      </Box>
    </Center>
  );
};

export default InfoPagesNavigation;
