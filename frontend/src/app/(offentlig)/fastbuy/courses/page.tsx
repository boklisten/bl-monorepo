import { Suspense } from "react";

import RedirectTo from "@/features/auth-linker/RedirectTo";

export default function FastBuyCoursesPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-web"} path={"fastbuy/courses"} />
    </Suspense>
  );
}
