import BranchLocationInfo from "@/components/info/BranchLocationInfo";
import BranchOpeningHours from "@/components/info/BranchOpeningHoursInfo";

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
