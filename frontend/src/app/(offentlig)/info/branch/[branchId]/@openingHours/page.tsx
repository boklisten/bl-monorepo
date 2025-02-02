import { Branch } from "@boklisten/backend/shared/branch/branch";
import { OpeningHour } from "@boklisten/backend/shared/opening-hour/opening-hour";
import moment from "moment/moment";

import BlFetcher from "@/api/blFetcher";
import BranchOpeningHours from "@/components/info/BranchOpeningHoursInfo";
import { apiClient } from "@/utils/api/apiClient";

export default async function OpeningHoursSlot({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const openingHoursUrl = `${apiClient.$url("collection.openinghours.getAll")}?branch=${branchId}&from=>${now}`;

  return (
    <BranchOpeningHours
      branchPromise={BlFetcher.get<[Branch]>(
        apiClient.$url("collection.branches.getId", {
          params: { id: branchId },
        }),
      )}
      openingHoursPromise={BlFetcher.get<OpeningHour[]>(openingHoursUrl)}
    />
  );
}
