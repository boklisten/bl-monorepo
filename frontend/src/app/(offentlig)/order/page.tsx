import { Suspense } from "react";

import RedirectTo from "@/features/auth/RedirectTo";

export default function OrderPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={"fastbuy/regions"} />
    </Suspense>
  );
}
