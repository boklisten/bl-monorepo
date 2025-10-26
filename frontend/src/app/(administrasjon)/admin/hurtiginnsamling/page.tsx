import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function BulkCollectionPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"bulk"} />
    </Suspense>
  );
}
