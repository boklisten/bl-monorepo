import {
  calculateFulfilledStandMatchItems,
  isStandMatchBegun,
  isStandMatchFulfilled,
} from "@frontend/components/matches/matches-helper";
import {
  formatActionsString,
  StandMatchTitle,
} from "@frontend/components/matches/matchesList/helper";
import MatchListItemBox from "@frontend/components/matches/matchesList/MatchListItemBox";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@frontend/components/matches/MeetingInfo";
import { Box, Typography } from "@mui/material";
import { StandMatchWithDetails } from "@shared/match/match-dtos";
import { FC } from "react";

const StandMatchListItem: FC<{
  standMatch: StandMatchWithDetails;
  currentUserId: string;
}> = ({ standMatch }) => {
  const numberHandoffItems = standMatch.expectedHandoffItems.length;
  const numberPickupItems = standMatch.expectedPickupItems.length;
  const hasHandoffItems = numberHandoffItems > 0;
  const hasPickupItems = numberPickupItems > 0;
  const { fulfilledPickupItems, fulfilledHandoffItems } =
    calculateFulfilledStandMatchItems(standMatch);
  const isBegun = isStandMatchBegun(standMatch);
  const isFulfilled = isStandMatchFulfilled(standMatch);
  return (
    <MatchListItemBox
      finished={isFulfilled}
      matchId={standMatch.id}
      matchType={"stand"}
    >
      <Typography variant="h3">
        <StandMatchTitle standMatch={standMatch} />
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
      {!isFulfilled && (
        <MeetingInfo
          meetingTime={standMatch.meetingInfo.date}
          meetingLocation={standMatch.meetingInfo.location}
        />
      )}
    </MatchListItemBox>
  );
};

export default StandMatchListItem;
