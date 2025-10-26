import { Suspense } from "react";

import RedirectToBlAdmin from "@/features/auth-linker/RedirectToBlAdmin";

export default function DatabaseBooksPage() {
  return (
    <Suspense>
      <RedirectToBlAdmin path={"database/books"} />
    </Suspense>
  );
}
