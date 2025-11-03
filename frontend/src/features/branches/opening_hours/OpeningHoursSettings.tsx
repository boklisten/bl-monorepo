import { Stack } from "@mantine/core";

import CreateOpeningHours from "@/features/branches/opening_hours/CreateOpeningHours";
import OpeningHoursList from "@/features/branches/opening_hours/OpeningHoursList";

export default function OpeningHoursSettings({
  branchId,
}: {
  branchId: string;
}) {
  return (
    <Stack>
      <OpeningHoursList branchId={branchId} />
      <CreateOpeningHours branchId={branchId} />
    </Stack>
  );
}
