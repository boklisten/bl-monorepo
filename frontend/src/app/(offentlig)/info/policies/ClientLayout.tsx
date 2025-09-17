"use client";
import { SegmentedControl } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  {
    value: "/info/policies/conditions",
    label: "Betingelser",
  },
  {
    value: "/info/policies/terms",
    label: "Vilkår",
  },
  {
    value: "/info/policies/privacy",
    label: "Personvernavtale",
  },
] as const satisfies {
  label: string;
  value: `/${string}`;
}[];

export default function ClientLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SegmentedControl
      value={pathname}
      data={tabs}
      // @ts-expect-error fixme: bad routing types
      onChange={(value) => router.push(value)}
    />
  );
}
