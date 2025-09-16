import { Suspense } from "react";

import RedirectTo from "@/components/RedirectTo";

export default function DatabaseBooksPage() {
  return (
    <Suspense>
      <RedirectTo target={"bl-admin"} path={"database/books"} />
    </Suspense>
  );
}
