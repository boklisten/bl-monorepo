import { StandMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Alert, Typography } from "@mui/material";

import {
  calculateFulfilledStandMatchItems,
  calculateItemStatuses,
  ItemStatus,
  MatchHeader,
} from "@/components/matches/matches-helper";
import { StandMatchTitle } from "@/components/matches/matchesList/helper";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MatchItemTable from "@/components/matches/MatchItemTable";
import MeetingInfo from "@/components/matches/MeetingInfo";

const StandMatchDetail = ({
  standMatch,
}: {
  standMatch: StandMatchWithDetails;
}) => {
  const { fulfilledHandoffItems, fulfilledPickupItems } =
    calculateFulfilledStandMatchItems(standMatch);
  const isFulfilled =
    fulfilledHandoffItems.length >= standMatch.expectedHandoffItems.length &&
    fulfilledPickupItems.length >= standMatch.expectedPickupItems.length;

  let handoffItemStatuses: ItemStatus[];
  let pickupItemStatuses: ItemStatus[];
  try {
    handoffItemStatuses = calculateItemStatuses(
      standMatch,
      (match) => match.expectedHandoffItems,
      fulfilledHandoffItems,
    );
    pickupItemStatuses = calculateItemStatuses(
      standMatch,
      (match) => match.expectedPickupItems,
      fulfilledPickupItems,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return <Alert severity="error">En feil oppstod: {error?.message}</Alert>;
  }

  const hasHandoffItems = standMatch.expectedHandoffItems.length > 0;
  const hasPickupItems = standMatch.expectedPickupItems.length > 0;

  return (
    <>
      <Typography variant="h1">
        <StandMatchTitle standMatch={standMatch} />
      </Typography>

      {isFulfilled && (
        <Alert sx={{ marginTop: 2, marginBottom: 2 }}>
          Du har mottatt og levert alle bøkene for denne overleveringen.
        </Alert>
      )}

      {hasHandoffItems && (
        <ProgressBar
          percentComplete={
            (fulfilledHandoffItems.length * 100) /
            standMatch.expectedHandoffItems.length
          }
          subtitle={
            <>
              {fulfilledHandoffItems.length} av{" "}
              {standMatch.expectedHandoffItems.length} bøker levert
            </>
          }
        />
      )}

      {hasPickupItems && (
        <ProgressBar
          percentComplete={
            (fulfilledPickupItems.length * 100) /
            standMatch.expectedPickupItems.length
          }
          subtitle={
            <>
              {fulfilledPickupItems.length} av{" "}
              {standMatch.expectedPickupItems.length} bøker mottatt
            </>
          }
        />
      )}

      {hasHandoffItems && (
        <>
          <MatchHeader>Disse bøkene skal leveres inn</MatchHeader>
          <MatchItemTable itemStatuses={handoffItemStatuses} isSender={true} />
        </>
      )}

      {hasPickupItems && (
        <>
          <MatchHeader>Disse bøkene skal hentes</MatchHeader>
          <MatchItemTable itemStatuses={pickupItemStatuses} isSender={false} />
        </>
      )}

      <MatchHeader>Du skal på stand:</MatchHeader>
      <MeetingInfo
        meetingLocation={standMatch.meetingInfo.location}
        meetingTime={standMatch.meetingInfo.date}
      />
    </>
  );
};

export default StandMatchDetail;
