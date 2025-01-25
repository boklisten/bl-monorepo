import { Box, Typography } from "@mui/material";
import { StandMatchWithDetails } from "@shared/match/match-dtos";
import { FC } from "react";

import {
  calculateFulfilledStandMatchItems,
  isStandMatchBegun,
  isStandMatchFulfilled,
} from "@/components/matches/matches-helper";
import {
  formatActionsString,
  StandMatchTitle,
} from "@/components/matches/matchesList/helper";
import MatchListItemBox from "@/components/matches/matchesList/MatchListItemBox";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MeetingInfo from "@/components/matches/MeetingInfo";

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
          {hasHandoffItems && hasPickupItems ? (
            <>
              <ProgressBar
                percentComplete={
                  (fulfilledHandoffItems.length * 100) / numberHandoffItems
                }
                subtitle={
                  <Box>
                    Utvekslet {fulfilledHandoffItems.length} av{" "}
                    {numberHandoffItems} bøker
                  </Box>
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
                  <Box>
                    Levert {fulfilledHandoffItems.length} av{" "}
                    {numberHandoffItems} bøker
                  </Box>
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
                  <Box>
                    Mottatt {fulfilledPickupItems.length} av {numberPickupItems}{" "}
                    bøker
                  </Box>
                }
              />
            </>
          ) : (
            <></>
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
