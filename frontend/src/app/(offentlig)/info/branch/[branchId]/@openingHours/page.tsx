import { Branch } from "@boklisten/backend/shared/branch/branch";
import { OpeningHour } from "@boklisten/backend/shared/opening-hour/opening-hour";
import moment from "moment/moment";

import BlFetcher from "@/api/blFetcher";
import BranchOpeningHours from "@/components/info/BranchOpeningHoursInfo";
import { publicApiClient } from "@/utils/api/publicApiClient";

export default async function OpeningHoursSlot({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const openingHoursUrl = publicApiClient.$url(
    "collection.openinghours.getAll",
    {
      query: {
        branch: branchId,
        from: ">" + now,
      },
    },
  );

  return (
    <BranchOpeningHours
      branchPromise={BlFetcher.get<[Branch]>(
        publicApiClient.$url("collection.branches.getId", {
          params: { id: branchId },
        }),
      )}
      openingHoursPromise={BlFetcher.get<OpeningHour[]>(openingHoursUrl)}
    />
  );
}
