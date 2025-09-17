import BranchLocationInfo from "@/features/info/BranchLocationInfo";
import BranchOpeningHours from "@/features/info/BranchOpeningHoursInfo";

export default async function BranchPage({
  params,
}: PageProps<"/info/branch/[branchId]">) {
  const { branchId } = await params;

  return (
    <>
      <BranchLocationInfo branchId={branchId} />
      <BranchOpeningHours branchId={branchId} />
    </>
  );
}
