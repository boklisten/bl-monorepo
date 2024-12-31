import { BranchLocationLayout } from "@frontend/app/(offentlig)/info/branch/[branchId]/@location/_layout";
import { Skeleton } from "@mui/material";

export default function BranchLocationLoading() {
  return (
    <BranchLocationLayout>
      <Skeleton width={150} />
    </BranchLocationLayout>
  );
}
