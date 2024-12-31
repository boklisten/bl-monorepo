"use client";

import { Branch } from "@shared/branch/branch";
import { use } from "react";

export default function BranchLocationInfo({
  branchPromise,
}: {
  branchPromise: Promise<[Branch]>;
}) {
  const [branch] = use(branchPromise);

  return branch.location?.address;
}
