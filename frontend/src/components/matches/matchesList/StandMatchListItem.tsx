import {
  calculateFulfilledStandMatchItems,
  isMatchBegun,
  isMatchFulfilled,
} from "@frontend/components/matches/matches-helper";
import {
  formatActionsString,
  StandMatchTitle,
} from "@frontend/components/matches/matchesList/helper";
import MatchListItemBox from "@frontend/components/matches/matchesList/MatchListItemBox";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@frontend/components/matches/MeetingInfo";
import { StandMatchWithDetails } from "@frontend/utils/types";
import { Box, Typography } from "@mui/material";
import { FC } from "react";

const StandMatchListItem: FC<{
  match: StandMatchWithDetails;
  currentUserId: string;
}> = ({ match }) => {
  const numberHandoffItems = match.expectedHandoffItems.length;
  const numberPickupItems = match.expectedPickupItems.length;
  const hasHandoffItems = numberHandoffItems > 0;
  const hasPickupItems = numberPickupItems > 0;
  const { fulfilledPickupItems, fulfilledHandoffItems } =
    calculateFulfilledStandMatchItems(match);
  const isBegun = isMatchBegun(match, false);
  const isFulfilled = isMatchFulfilled(match, false);
  return (
    <MatchListItemBox finished={isFulfilled} matchId={match.id}>
      <Typography variant="h3">
        <StandMatchTitle match={match} />
      </Typography>
      {isBegun && (
        <>
          {hasHandoffItems && (
            <>
              <ProgressBar
                percentComplete={
                  (fulfilledHandoffItems.length * 100) / numberHandoffItems
                }
                subtitle={
                  <Box>
                    Levert {fulfilledHandoffItems.length} av{" "}
                    {numberHandoffItems} bøker
                  </Box>
                }
              />
            </>
          )}
          {hasPickupItems && (
            <>
              <ProgressBar
                percentComplete={
                  (fulfilledPickupItems.length * 100) / numberPickupItems
                }
                subtitle={
                  <Box>
                    Mottatt {fulfilledPickupItems.length} av {numberPickupItems}{" "}
                    bøker
                  </Box>
                }
              />
            </>
          )}
        </>
      )}
      {!isBegun && !isFulfilled && (
        <>
          <Box>
            {formatActionsString(numberHandoffItems, numberPickupItems)}
          </Box>
        </>
      )}
      {!isFulfilled && <MeetingInfo match={match} />}
    </MatchListItemBox>
  );
};

export default StandMatchListItem;
