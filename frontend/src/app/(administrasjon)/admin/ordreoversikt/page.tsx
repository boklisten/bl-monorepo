import { Suspense } from "react";

import RedirectTo from "@/features/auth-linker/RedirectTo";

export default function OrderManagerPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"scanner"} />
    </Suspense>
  );
}
