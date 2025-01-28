import { UserMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Box, Typography } from "@mui/material";
import { FC } from "react";

import { calculateUserMatchStatus } from "@/components/matches/matches-helper";
import {
  formatActionsString,
  UserMatchTitle,
} from "@/components/matches/matchesList/helper";
import MatchListItemBox from "@/components/matches/matchesList/MatchListItemBox";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@/components/matches/MeetingInfo";

const UserMatchListItem: FC<{
  userMatch: UserMatchWithDetails;
  currentUserId: string;
}> = ({ userMatch, currentUserId }) => {
  const userMatchStatus = calculateUserMatchStatus(userMatch, currentUserId);
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
    <MatchListItemBox
      finished={isCurrentUserFulfilled}
      matchId={userMatch.id}
      matchType={"user"}
    >
      <Typography variant="h3">
        <UserMatchTitle userMatchStatus={userMatchStatus} />
      </Typography>

      {isCurrentUserStarted && (
        <>
          <ProgressBar
            percentComplete={
              (currentUserActualItemCount * 100) / currentUserExpectedItemCount
            }
            subtitle={
              <Box>
                {statusText} {currentUserActualItemCount} av{" "}
                {currentUserExpectedItemCount} bøker
              </Box>
            }
          />
        </>
      )}
      {!isCurrentUserStarted && !isCurrentUserFulfilled && (
        <>
          <Box>
            {formatActionsString(
              currentUser.items.length,
              currentUser.wantedItems.length,
            )}
          </Box>
        </>
      )}
      {!isCurrentUserFulfilled && (
        <MeetingInfo
          meetingLocation={userMatch.meetingInfo.location}
          meetingTime={userMatch.meetingInfo.date}
        />
      )}
    </MatchListItemBox>
  );
};

export default UserMatchListItem;
