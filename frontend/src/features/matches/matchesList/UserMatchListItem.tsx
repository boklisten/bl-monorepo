import { UserMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Text, Title } from "@mantine/core";

import {
  formatActionsString,
  UserMatchTitle,
} from "@/features/matches/matchesList/helper";
import MatchListItemCard from "@/features/matches/matchesList/MatchListItemCard";
import MeetingInfo from "@/features/matches/MeetingInfo";
import { calculateUserMatchStatus } from "@/shared/components/matches/matches-helper";
import ProgressBar from "@/shared/components/ProgressBar";

export default function UserMatchListItem({
  userMatch,
}: {
  userMatch: UserMatchWithDetails;
}) {
  const userMatchStatus = calculateUserMatchStatus(userMatch);
  const { currentUser, otherUser } = userMatchStatus;

  let statusText = "";
  if (currentUser.items.length > 0 && otherUser.items.length === 0) {
    statusText = "levert";
  } else if (
    currentUser.wantedItems.length > 0 &&
    otherUser.wantedItems.length === 0
  ) {
    statusText = "mottatt";
  } else {
    statusText = "utvekslet";
  }

  const currentUserExpectedItemCount =
    currentUser.items.length + currentUser.wantedItems.length;
  const currentUserActualItemCount =
    currentUser.deliveredItems.length + currentUser.receivedItems.length;
  const isCurrentUserStarted = currentUserActualItemCount > 0;
  const isCurrentUserFulfilled =
    currentUserActualItemCount >= currentUserExpectedItemCount;
  return (
    <MatchListItemCard
      finished={isCurrentUserFulfilled}
      matchId={userMatch.id}
      matchType={"user"}
    >
      <Title order={4}>
        <UserMatchTitle userMatchStatus={userMatchStatus} />
      </Title>

      {isCurrentUserStarted && (
        <>
          <ProgressBar
            percentComplete={
              (currentUserActualItemCount * 100) / currentUserExpectedItemCount
            }
            subtitle={
              <Text size={"sm"}>
                {statusText} {currentUserActualItemCount} av{" "}
                {currentUserExpectedItemCount} bøker
              </Text>
            }
          />
        </>
      )}
      {!isCurrentUserStarted && !isCurrentUserFulfilled && (
        <Text>
          {formatActionsString(
            currentUser.items.length,
            currentUser.wantedItems.length,
          )}
        </Text>
      )}
      {!isCurrentUserFulfilled && (
        <MeetingInfo
          meetingLocation={userMatch.meetingInfo.location}
          meetingTime={userMatch.meetingInfo.date}
        />
      )}
    </MatchListItemCard>
  );
}
