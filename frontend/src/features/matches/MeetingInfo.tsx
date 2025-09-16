import { Anchor, Group, Stack, Text } from "@mantine/core";
import { IconClock, IconMapPin } from "@tabler/icons-react";
import Link from "next/link";

import { FormattedDatetime } from "@/features/matches/matchesList/helper";

const MeetingInfo = ({
  meetingTime,
  meetingLocation,
}: {
  meetingTime?: Date | undefined;
  meetingLocation: string;
}) => {
  return (
    <Stack gap={"xs"}>
      <Group gap={5}>
        <IconClock />
        {(meetingTime && (
          <FormattedDatetime date={new Date(meetingTime)} />
        )) || (
          <Text>
            Du kan møte opp når standen vår er åpen.{" "}
            <Anchor component={Link} href="/info/branch">
              Se åpningstider her
            </Anchor>
          </Text>
        )}
      </Group>
      <Group gap={5}>
        <IconMapPin />
        <Text>{meetingLocation}</Text>
      </Group>
    </Stack>
  );
};

export default MeetingInfo;
