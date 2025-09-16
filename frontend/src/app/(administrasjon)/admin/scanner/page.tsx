import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function ScannerPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"scanner"} />
    </Suspense>
  );
}
