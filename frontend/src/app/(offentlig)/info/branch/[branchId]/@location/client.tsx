"use client";

import { BranchLocationLayout } from "@frontend/app/(offentlig)/info/branch/[branchId]/@location/_layout";
import { Branch } from "@shared/branch/branch";
import { use } from "react";

export default function BranchLocationInfo({
  branchPromise,
}: {
  branchPromise: Promise<[Branch]>;
}) {
  const [branch] = use(branchPromise);
  if (!branch.location?.address) {
    return <></>;
  }

  return (
    <BranchLocationLayout>{branch.location?.address}</BranchLocationLayout>
  );
}
