"use client";

import { Branch } from "@shared/branch/branch";
import { notFound } from "next/navigation";
import { use } from "react";

export default function BranchLocationInfo({
  branchPromise,
}: {
  branchPromise: Promise<[Branch]>;
}) {
  const [branch] = use(branchPromise);

  if (!branch.location?.address) {
    notFound();
  }

  return branch.location?.address;
}
