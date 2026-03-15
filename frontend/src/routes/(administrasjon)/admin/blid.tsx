import { createFileRoute } from "@tanstack/react-router";
import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export const Route = createFileRoute("/(administrasjon)/admin/blid")({
  component: BlidSearchPage,
});

function BlidSearchPage() {
  return <RedirectToBlAdmin path={"blid"} />;
}
