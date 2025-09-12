"use client";
import {
  Center,
  Tabs,
  TabsList,
  TabsTab,
  Select,
  Box,
  Anchor,
} from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
] as const satisfies {
  label: string;
  value: `/${string}`;
}[];

const InfoPagesNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Center>
      <Box className="hidden sm:flex">
        <Tabs
          value={
            tabs.find((tab) => pathname.includes(tab.value))?.value ?? pathname
          }
        >
          <TabsList className={"justify-center"}>
            {tabs.map((tab) => (
              <Anchor
                component={Link}
                underline={"never"}
                key={tab.value}
                href={tab.value}
              >
                <TabsTab value={tab.value}>{tab.label}</TabsTab>
              </Anchor>
            ))}
          </TabsList>
        </Tabs>
      </Box>
      <Box className="flex sm:hidden">
        <Select
          data={tabs}
          label={"Velg side"}
          value={pathname}
          onChange={(href) => {
            // @ts-expect-error fixme: bad routing types
            router.push(href);
          }}
        />
      </Box>
    </Center>
  );
};

export default InfoPagesNavigation;
