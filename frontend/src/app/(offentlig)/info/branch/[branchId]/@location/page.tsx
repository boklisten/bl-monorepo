import { Branch } from "@boklisten/backend/shared/branch/branch";

import BranchLocationInfo from "@/components/info/BranchLocationInfo";
import unpack from "@/utils/api/bl-api-request";
import { publicApiClient } from "@/utils/api/publicApiClient";

export default async function BranchLocationSlot({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  return (
    <BranchLocationInfo
      branchPromise={publicApiClient
        .$route("collection.branches.getId", {
          id: branchId,
        })
        .$get()
        .then(unpack<[Branch]>)}
    />
  );
}
