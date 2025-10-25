import { Group, Stack, Text } from "@mantine/core";
import { IconClock, IconMapPin } from "@tabler/icons-react";

import { FormattedDatetime } from "@/features/matches/matchesList/helper";
import NextAnchor from "@/shared/components/NextAnchor";

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
            <NextAnchor href="/info/branch">Se åpningstider her</NextAnchor>
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
