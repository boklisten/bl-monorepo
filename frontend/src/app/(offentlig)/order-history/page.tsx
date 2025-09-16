import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function OrdersPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={"u/order"} />
    </Suspense>
  );
}
