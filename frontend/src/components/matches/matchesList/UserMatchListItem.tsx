import {
  calculateFulfilledUserMatchItems,
  isUserMatchFulfilled,
} from "@frontend/components/matches/matches-helper";
import {
  formatActionsString,
  UserMatchTitle,
} from "@frontend/components/matches/matchesList/helper";
import MatchListItemBox from "@frontend/components/matches/matchesList/MatchListItemBox";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@frontend/components/matches/MeetingInfo";
import { Box, Typography } from "@mui/material";
import { UserMatchWithDetails } from "@shared/match/match-dtos";
import { FC } from "react";

const UserMatchListItem: FC<{
  userMatch: UserMatchWithDetails;
  currentUserId: string;
}> = ({ userMatch, currentUserId }) => {
  const numberItems =
    userMatch.expectedAToBItems.length + userMatch.expectedBToAItems.length;
  // If isCustomerA === false, then we know that they are customerB
  const isCustomerA = userMatch.customerA === currentUserId;

  const fulfilledItems = calculateFulfilledUserMatchItems(
    userMatch,
    isCustomerA,
  );
  const isBegun = fulfilledItems.length > 0;
  const isFulfilled = isUserMatchFulfilled(userMatch, isCustomerA);
  return (
    <MatchListItemBox
      finished={isFulfilled}
      matchId={userMatch.id}
      matchType={"user"}
    >
      <Typography variant="h3">
        <UserMatchTitle userMatch={userMatch} isCustomerA={isCustomerA} />
      </Typography>

      {isBegun && (
        <>
          <ProgressBar
            percentComplete={(fulfilledItems.length * 100) / numberItems}
            subtitle={
              <Box>
                {isCustomerA ? "Levert" : "Mottatt"} {fulfilledItems.length} av{" "}
                {numberItems} bøker
              </Box>
            }
          />
        </>
      )}
      {!isBegun && !isFulfilled && (
        <>
          <Box>
            {formatActionsString(
              isCustomerA
                ? userMatch.expectedAToBItems.length
                : userMatch.expectedBToAItems.length,
              isCustomerA
                ? userMatch.expectedBToAItems.length
                : userMatch.expectedAToBItems.length,
            )}
          </Box>
        </>
      )}
      {!isFulfilled && (
        <MeetingInfo
          meetingLocation={userMatch.meetingInfo.location}
          meetingTime={userMatch.meetingInfo.date}
        />
      )}
    </MatchListItemBox>
  );
};

export default UserMatchListItem;
