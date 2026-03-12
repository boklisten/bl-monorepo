import BranchLocationInfo from "@/features/info/BranchLocationInfo";
import BranchOpeningHours from "@/features/info/BranchOpeningHoursInfo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info/branch/$branchId")({
  component: BranchPage,
});
function BranchPage() {
  const { branchId } = Route.useParams();

  return (
    <>
      <BranchLocationInfo branchId={branchId} />
      <BranchOpeningHours branchId={branchId} />
    </>
  );
}
