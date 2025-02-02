import { Branch } from "@boklisten/backend/shared/branch/branch";

import BlFetcher from "@/api/blFetcher";
import BranchLocationInfo from "@/components/info/BranchLocationInfo";
import { apiClient } from "@/utils/api/apiClient";

export default async function BranchLocationSlot({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  return (
    <BranchLocationInfo
      branchPromise={BlFetcher.get<[Branch]>(
        apiClient.$url("collection.branches.getId", {
          params: { id: branchId },
        }),
      )}
    />
  );
}
