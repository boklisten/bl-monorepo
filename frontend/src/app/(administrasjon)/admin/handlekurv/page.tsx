import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function CartPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"cart/customer"} />
    </Suspense>
  );
}
