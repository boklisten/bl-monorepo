import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function CartPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"cart/customer"} />
    </Suspense>
  );
}
