import { createFileRoute } from "@tanstack/react-router";
import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin.tsx";

export const Route = createFileRoute("/(administrasjon)/admin/hurtiginnsamling")({
  component: BulkCollectionPage,
});

function BulkCollectionPage() {
  return <RedirectToBlAdmin path={"bulk"} />;
}
