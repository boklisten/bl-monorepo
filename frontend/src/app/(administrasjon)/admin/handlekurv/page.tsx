import { Suspense } from "react";

import RedirectTo from "@/features/auth/RedirectTo";

export default function CartPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"cart/customer"} />
    </Suspense>
  );
}
