import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function OrderManagerPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"scanner"} />
    </Suspense>
  );
}
