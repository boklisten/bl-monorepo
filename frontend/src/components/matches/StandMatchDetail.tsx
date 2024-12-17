import {
  calculateFulfilledStandMatchItems,
  calculateItemStatuses,
  ItemStatus,
  MatchHeader,
} from "@frontend/components/matches/matches-helper";
import { StandMatchTitle } from "@frontend/components/matches/matchesList/helper";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import MatchItemTable from "@frontend/components/matches/MatchItemTable";
import MeetingInfo from "@frontend/components/matches/MeetingInfo";
import { StandMatchWithDetails } from "@frontend/utils/types";
import { Alert, Typography } from "@mui/material";

const StandMatchDetail = ({ match }: { match: StandMatchWithDetails }) => {
  const { fulfilledHandoffItems, fulfilledPickupItems } =
    calculateFulfilledStandMatchItems(match);
  const isFulfilled =
    fulfilledHandoffItems.length >= match.expectedHandoffItems.length &&
    fulfilledPickupItems.length >= match.expectedPickupItems.length;

  let handoffItemStatuses: ItemStatus[];
  let pickupItemStatuses: ItemStatus[];
  try {
    handoffItemStatuses = calculateItemStatuses(
      match,
      (match) => match.expectedHandoffItems,
      fulfilledHandoffItems,
    );
    pickupItemStatuses = calculateItemStatuses(
      match,
      (match) => match.expectedPickupItems,
      fulfilledPickupItems,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return <Alert severity="error">En feil oppstod: {error?.message}</Alert>;
  }

  const hasHandoffItems = match.expectedHandoffItems.length > 0;
  const hasPickupItems = match.expectedPickupItems.length > 0;

  return (
    <>
      <Typography variant="h1">
        <StandMatchTitle match={match} />
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
            match.expectedHandoffItems.length
          }
          subtitle={
            <>
              {fulfilledHandoffItems.length} av{" "}
              {match.expectedHandoffItems.length} bøker levert
            </>
          }
        />
      )}

      {hasPickupItems && (
        <ProgressBar
          percentComplete={
            (fulfilledPickupItems.length * 100) /
            match.expectedPickupItems.length
          }
          subtitle={
            <>
              {fulfilledPickupItems.length} av{" "}
              {match.expectedPickupItems.length} bøker mottatt
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
      <MeetingInfo match={match} />
    </>
  );
};

export default StandMatchDetail;
