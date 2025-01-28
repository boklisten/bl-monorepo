import { Branch } from "@boklisten/backend/shared/branch/branch";

import BlFetcher from "@/api/blFetcher";
import BranchLocationInfo from "@/components/info/BranchLocationInfo";
import BL_CONFIG from "@/utils/bl-config";

export default async function BranchLocationSlot({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const branchUrl = `${BL_CONFIG.collection.branch}/${branchId}`;

  return (
    <BranchLocationInfo branchPromise={BlFetcher.get<[Branch]>(branchUrl)} />
  );
}
