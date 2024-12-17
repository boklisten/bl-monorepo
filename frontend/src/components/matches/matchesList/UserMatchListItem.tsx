import { Box, Typography } from "@mui/material";
import { FC } from "react";

import {
  calculateFulfilledUserMatchItems,
  isMatchBegun,
  isMatchFulfilled,
  isUserSenderInMatch,
} from "@/components/matches/matches-helper";
import {
  formatActionsString,
  UserMatchTitle,
} from "@/components/matches/matchesList/helper";
import MatchListItemBox from "@/components/matches/matchesList/MatchListItemBox";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@/components/matches/MeetingInfo";
import { UserMatchWithDetails } from "@/utils/types";

const UserMatchListItem: FC<{
  match: UserMatchWithDetails;
  currentUserId: string;
}> = ({ match, currentUserId }) => {
  const numberItems = match.expectedItems.length;
  const isSender = isUserSenderInMatch(match, currentUserId);
  const isBegun = isMatchBegun(match, isSender);
  const isFulfilled = isMatchFulfilled(match, isSender);
  const fulfilledItems = calculateFulfilledUserMatchItems(match, isSender);
  return (
    <MatchListItemBox finished={isFulfilled} matchId={match.id}>
      <Typography variant="h3">
        <UserMatchTitle match={match} isSender={isSender} />
      </Typography>

      {isBegun && (
        <>
          <ProgressBar
            percentComplete={(fulfilledItems.length * 100) / numberItems}
            subtitle={
              <Box>
                {isSender ? "Levert" : "Mottatt"} {fulfilledItems.length} av{" "}
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
              isSender ? numberItems : 0,
              isSender ? 0 : numberItems,
            )}
          </Box>
        </>
      )}
      {!isFulfilled && <MeetingInfo match={match} />}
    </MatchListItemBox>
  );
};

export default UserMatchListItem;
