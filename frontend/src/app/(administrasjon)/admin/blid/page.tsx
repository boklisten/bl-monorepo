import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function BlidSearchPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"blid"} />
    </Suspense>
  );
}
