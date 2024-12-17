"use client";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Box } from "@mui/system";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ReactElement } from "react";
import stringSimilarity from "string-similarity";

export interface DynamicSubNavProps {
  tabs: {
    label: string;
    href: string;
  }[];
}

const DynamicSubNavInner = ({
  selectedHref,
  tabs,
  small,
}: {
  selectedHref: string | null;
  tabs: { label: string; href: string }[];
  small?: boolean;
}): ReactElement => (
  <Box
    sx={{
      display: small ? { xs: "flex", sm: "none" } : { xs: "none", sm: "flex" },
      justifyContent: "center",
      my: 4,
    }}
  >
    <ToggleButtonGroup
      value={selectedHref}
      exclusive
      orientation={small ? "vertical" : "horizontal"}
    >
      {tabs.map(({ label, href }) => (
        <ToggleButton
          value={href}
          tabIndex={-1}
          selected={selectedHref === href}
          key={href}
          sx={{
            p: 0,
            borderRadius: 2,
          }}
        >
          <NextLink
            href={href}
            role="tab"
            style={{
              color: "inherit",
              padding: "0.5rem 0.6rem",
              textDecoration: "none",
            }}
          >
            {label}
          </NextLink>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

export default function DynamicSubNav({ tabs }: DynamicSubNavProps) {
  const pathname = usePathname();

  const selectedHref =
    tabs[
      stringSimilarity.findBestMatch(
        pathname,
        tabs.map((tab) => tab.href),
      ).bestMatchIndex
    ]?.href ?? null;

  return (
    <>
      <DynamicSubNavInner selectedHref={selectedHref} tabs={tabs} />
      <DynamicSubNavInner selectedHref={selectedHref} tabs={tabs} small />
    </>
  );
}
