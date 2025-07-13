import { StandMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { QrCode } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

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

function useMeetingStatus(meetingTime?: string | Date) {
  const [isTooEarly, setIsTooEarly] = useState(() =>
    moment().isBefore(moment(meetingTime)),
  );

  useEffect(() => {
    if (!meetingTime) return;

    const checkStatus = () => {
      setIsTooEarly(moment().isBefore(moment(meetingTime)));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10_000);

    return () => clearInterval(interval);
  }, [meetingTime]);

  return isTooEarly;
}

const StandMatchDetail = ({
  standMatch,
}: {
  standMatch: StandMatchWithDetails;
}) => {
  const [customerIdDialogOpen, setCustomerIdDialogOpen] = useState(false);
  const tooEarly = useMeetingStatus(standMatch.meetingInfo.date);
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

      <Stack
        alignItems={"center"}
        sx={{ width: "100%", textTransform: "none" }}
      >
        <Button
          variant={"contained"}
          startIcon={<QrCode />}
          onClick={() => setCustomerIdDialogOpen(true)}
        >
          Vis kunde-ID
        </Button>
      </Stack>
      <Dialog
        open={customerIdDialogOpen}
        onClose={() => setCustomerIdDialogOpen(false)}
      >
        <DialogContent>
          <Stack sx={{ alignItems: "center", gap: 1 }}>
            <QRCode value={standMatch.customer} />
            <Typography variant={"h1"} fontWeight={"bolder"}>
              Oppmøte {moment(standMatch.meetingInfo?.date).format("HH:mm")}
            </Typography>
            {tooEarly && (
              <Alert severity={"info"}>
                <AlertTitle>For tidlig ute</AlertTitle>
                Din oppmøtetid har ikke kommet enda. Vent med å stille deg i kø
                til tidspunktet du har fått tildelt.
              </Alert>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

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
