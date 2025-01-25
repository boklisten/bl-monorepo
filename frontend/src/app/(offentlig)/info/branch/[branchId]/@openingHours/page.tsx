import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment/moment";

import BlFetcher from "@/api/blFetcher";
import BranchOpeningHours from "@/components/info/BranchOpeningHoursInfo";
import BL_CONFIG from "@/utils/bl-config";

export default async function OpeningHoursSlot({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const branchUrl = `${BL_CONFIG.collection.branch}/${branchId}`;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const openingHoursUrl = `${BL_CONFIG.collection.openingHour}?branch=${branchId}&from=>${now}`;

  return (
    <BranchOpeningHours
      branchPromise={BlFetcher.get<[Branch]>(branchUrl)}
      openingHoursPromise={BlFetcher.get<OpeningHour[]>(openingHoursUrl)}
    />
  );
}
