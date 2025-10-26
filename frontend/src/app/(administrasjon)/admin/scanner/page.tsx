import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function ScannerPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"scanner"} />
    </Suspense>
  );
}
