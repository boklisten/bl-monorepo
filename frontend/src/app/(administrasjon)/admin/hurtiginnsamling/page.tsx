import { Suspense } from "react";

import RedirectTo from "@/features/auth/RedirectTo";

export default function BulkCollectionPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"bulk"} />
    </Suspense>
  );
}
