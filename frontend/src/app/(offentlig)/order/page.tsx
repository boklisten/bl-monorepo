import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function OrderPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={"fastbuy/regions"} />
    </Suspense>
  );
}
