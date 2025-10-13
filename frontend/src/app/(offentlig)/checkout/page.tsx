import { Suspense } from "react";

import VippsCheckoutFrame from "@/features/checkout/VippsCheckoutFrame";

export default function CheckoutPage() {
  return (
    <Suspense>
      <VippsCheckoutFrame />
    </Suspense>
  );
}
