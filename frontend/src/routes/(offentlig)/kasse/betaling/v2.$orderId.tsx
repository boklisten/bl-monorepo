import { createFileRoute } from "@tanstack/react-router";
import KustomCheckout from "@/features/checkout/KustomCheckout";

export const Route = createFileRoute("/(offentlig)/kasse/betaling/v2/$orderId")({
  head: () => ({
    meta: [{ title: "Betaling | Boklisten.no" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();

  return <KustomCheckout orderId={orderId ?? ""} />;
}
