import { StandMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Group, Text } from "@mantine/core";
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconSwitchHorizontal,
} from "@tabler/icons-react";

import { UserMatchStatus } from "@/components/matches/matches-helper";

export function formatActionsString(handoffItems: number, pickupItems: number) {
  const hasHandoffItems = handoffItems > 0;
  const hasPickupItems = pickupItems > 0;
  const stringBuilder: string[] = [];
  stringBuilder.push("Du skal ");

  if (hasHandoffItems) {
    stringBuilder.push("levere ");
    if (handoffItems === 1) {
      stringBuilder.push("én");
      if (!hasPickupItems) {
        stringBuilder.push(" bok");
      }
    } else {
      stringBuilder.push(`${handoffItems}`);
      if (!hasPickupItems) {
        stringBuilder.push(" bøker");
      }
    }
    if (hasPickupItems) {
      stringBuilder.push(" og ");
    }
  }
  if (hasPickupItems) {
    stringBuilder.push("motta ");
    if (pickupItems === 1) {
      stringBuilder.push("én bok");
    } else {
      stringBuilder.push(`${pickupItems} bøker`);
    }
  }
  return stringBuilder.join("");
}

export const FormattedDatetime = ({ date }: { date: Date }) => {
  const dateString = date.toLocaleDateString("no", {
    timeZone: "Europe/Oslo",
    dateStyle: "long",
  });
  const timeString = date.toLocaleTimeString("no", {
    timeZone: "Europe/Oslo",
    timeStyle: "short",
  });
  return (
    <>
      <Text>{timeString}</Text>
      <Text c={"dimmed"}>, {dateString}</Text>
    </>
  );
};

export const UserMatchTitle = ({
  userMatchStatus,
}: {
  userMatchStatus: UserMatchStatus;
}) => {
  const { currentUser, otherUser } = userMatchStatus;
  if (currentUser.items.length > 0 && otherUser.items.length === 0) {
    return (
      <Group gap={2}>
        <Text c={"dimmed"}>Meg</Text>
        <IconChevronsRight />
        <Text fw={"bold"}>{otherUser.name}</Text>
      </Group>
    );
  }
  if (
    currentUser.wantedItems.length > 0 &&
    otherUser.wantedItems.length === 0
  ) {
    return (
      <Group gap={2}>
        <Text fw={"bold"}>{otherUser.name}</Text>
        <IconChevronsRight />
        <Text c={"dimmed"}>Meg</Text>
      </Group>
    );
  }
  return (
    <Group gap={2}>
      <Text c={"dimmed"}>Meg</Text>
      <IconSwitchHorizontal size={20} />
      <Text fw={"bold"}>{otherUser.name}</Text>
    </Group>
  );
};

export const StandMatchTitle = ({
  standMatch,
}: {
  standMatch: StandMatchWithDetails;
}) => {
  const hasHandoffItems = standMatch.expectedHandoffItems.length > 0;
  const hasPickupItems = standMatch.expectedPickupItems.length > 0;

  const isMeFirst = hasPickupItems ? hasHandoffItems : true;

  const left = isMeFirst ? (
    <Text c={"dimmed"}>Meg</Text>
  ) : (
    <Text fw={"bold"}>Stand</Text>
  );
  const right = isMeFirst ? (
    <Text fw={"bold"}>Stand</Text>
  ) : (
    <Text c={"dimmed"}>Meg</Text>
  );
  const arrow = hasHandoffItems ? (
    hasPickupItems ? (
      <IconSwitchHorizontal size={20} />
    ) : (
      <IconChevronsLeft />
    )
  ) : (
    <IconChevronsRight />
  );
  return (
    <Group gap={2}>
      {left}
      {arrow}
      {right}
    </Group>
  );
};
