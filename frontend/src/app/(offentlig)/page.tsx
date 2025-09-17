import { Suspense } from "react";

import RedirectTo from "@/features/auth-linker/RedirectTo";

export default function IndexPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={""} />
    </Suspense>
  );
}
