import PoliciesNavigation from "@/features/info/PoliciesNavigation";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/policies")({
  component: PoliciesLayout,
});

function PoliciesLayout() {
  return (
    <>
      <PoliciesNavigation />
      <Outlet />
    </>
  );
}
