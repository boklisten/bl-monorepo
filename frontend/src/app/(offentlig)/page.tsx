import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function IndexPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={""} />
    </Suspense>
  );
}
