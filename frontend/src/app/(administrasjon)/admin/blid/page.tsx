import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function BlidSearchPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"blid"} />
    </Suspense>
  );
}
