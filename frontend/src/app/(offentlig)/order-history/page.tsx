import { Suspense } from "react";

import RedirectTo from "@/features/auth/RedirectTo";

export default function OrdersPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={"u/order"} />
    </Suspense>
  );
}
