import { Suspense } from "react";

import RedirectTo from "@/features/auth/RedirectTo";

export default function ScannerPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"scanner"} />
    </Suspense>
  );
}
