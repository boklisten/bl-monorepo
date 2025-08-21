import { Branch } from "@boklisten/backend/shared/branch";
import { OpeningHour } from "@boklisten/backend/shared/opening-hour";
import moment from "moment/moment";

import BranchOpeningHours from "@/components/info/BranchOpeningHoursInfo";
import unpack from "@/utils/api/bl-api-request";
import { publicApiClient } from "@/utils/api/publicApiClient";

export default async function OpeningHoursSlot({
  params,
}: PageProps<"/info/branch/[branchId]">) {
  const { branchId } = await params;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");

  return (
    <BranchOpeningHours
      branchPromise={publicApiClient
        .$route("collection.branches.getId", {
          id: branchId,
        })
        .$get()
        .then(unpack<[Branch]>)}
      openingHoursPromise={publicApiClient
        .$route("collection.openinghours.getAll")
        .$get({
          query: {
            branch: branchId,
            from: ">" + now,
          },
        })
        .then(unpack<OpeningHour[]>)}
    />
  );
}
