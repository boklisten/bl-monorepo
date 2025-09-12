import { StandMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Text, Title } from "@mantine/core";

import {
  calculateFulfilledStandMatchItems,
  isStandMatchBegun,
  isStandMatchFulfilled,
} from "@/components/matches/matches-helper";
import {
  formatActionsString,
  StandMatchTitle,
} from "@/components/matches/matchesList/helper";
import MatchListItemCard from "@/components/matches/matchesList/MatchListItemCard";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@/components/matches/MeetingInfo";

export default function StandMatchListItem({
  standMatch,
}: {
  standMatch: StandMatchWithDetails;
}) {
  const numberHandoffItems = standMatch.expectedHandoffItems.length;
  const numberPickupItems = standMatch.expectedPickupItems.length;
  const hasHandoffItems = numberHandoffItems > 0;
  const hasPickupItems = numberPickupItems > 0;
  const { fulfilledPickupItems, fulfilledHandoffItems } =
    calculateFulfilledStandMatchItems(standMatch);
  const isBegun = isStandMatchBegun(standMatch);
  const isFulfilled = isStandMatchFulfilled(standMatch);
  return (
    <MatchListItemCard
      finished={isFulfilled}
      matchId={standMatch.id}
      matchType={"stand"}
    >
      <Title order={4}>
        <StandMatchTitle standMatch={standMatch} />
      </Title>
      {isBegun && (
        <>
          {hasHandoffItems && hasPickupItems ? (
            <>
              <ProgressBar
                percentComplete={
                  (fulfilledHandoffItems.length * 100) / numberHandoffItems
                }
                subtitle={
                  <Text size={"sm"}>
                    Utvekslet {fulfilledHandoffItems.length} av{" "}
                    {numberHandoffItems} bøker
                  </Text>
                }
              />
            </>
          ) : (
            <></>
          )}
          {hasHandoffItems && !hasPickupItems ? (
            <>
              <ProgressBar
                percentComplete={
                  (fulfilledHandoffItems.length * 100) / numberHandoffItems
                }
                subtitle={
                  <Text size={"sm"}>
                    Levert {fulfilledHandoffItems.length} av{" "}
                    {numberHandoffItems} bøker
                  </Text>
                }
              />
            </>
          ) : (
            <></>
          )}
          {hasPickupItems && !hasHandoffItems ? (
            <>
              <ProgressBar
                percentComplete={
                  (fulfilledPickupItems.length * 100) / numberPickupItems
                }
                subtitle={
                  <Text size={"sm"}>
                    Mottatt {fulfilledPickupItems.length} av {numberPickupItems}{" "}
                    bøker
                  </Text>
                }
              />
            </>
          ) : (
            <></>
          )}
        </>
      )}
      {!isBegun && !isFulfilled && (
        <Text>
          {formatActionsString(numberHandoffItems, numberPickupItems)}
        </Text>
      )}
      {!isFulfilled && (
        <MeetingInfo
          meetingTime={standMatch.meetingInfo.date}
          meetingLocation={standMatch.meetingInfo.location}
        />
      )}
    </MatchListItemCard>
  );
}
