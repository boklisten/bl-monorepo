import { SegmentedControl } from "@mantine/core";
import { useLocation, useNavigate } from "@tanstack/react-router";

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

export default function PoliciesNavigation() {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <SegmentedControl value={pathname} data={tabs} onChange={(value) => navigate({ to: value })} />
  );
}
