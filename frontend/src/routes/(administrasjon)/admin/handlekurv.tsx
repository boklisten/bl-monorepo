import { createFileRoute } from "@tanstack/react-router";
import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin.tsx";

export const Route = createFileRoute("/(administrasjon)/admin/handlekurv")({
  component: CartPage,
});

function CartPage() {
  return <RedirectToBlAdmin path={"cart/customer"} />;
}
