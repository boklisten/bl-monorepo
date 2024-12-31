import BlFetcher from "@frontend/api/blFetcher";
import BranchLocationInfo from "@frontend/components/info/BranchLocationInfo";
import BL_CONFIG from "@frontend/utils/bl-config";
import { Branch } from "@shared/branch/branch";

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
