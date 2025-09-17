import { StandMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Button, Stack, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconQrcode } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import { StandMatchTitle } from "@/features/matches/matchesList/helper";
import MeetingInfo from "@/features/matches/MeetingInfo";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import SuccessAlert from "@/shared/components/alerts/SuccessAlert";
import {
  calculateFulfilledStandMatchItems,
  calculateItemStatuses,
  ItemStatus,
  MatchHeader,
} from "@/shared/components/matches/matches-helper";
import MatchItemTable from "@/shared/components/matches/MatchItemTable";
import ProgressBar from "@/shared/components/ProgressBar";
import { GENERIC_ERROR_TEXT } from "@/shared/utils/constants";

function useMeetingStatus(meetingTime?: string | Date) {
  const [isTooEarly, setIsTooEarly] = useState(() =>
    dayjs().isBefore(dayjs(meetingTime)),
  );

  useEffect(() => {
    if (!meetingTime) return;

    const checkStatus = () => {
      setIsTooEarly(dayjs().isBefore(dayjs(meetingTime)));
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
    return <ErrorAlert title={GENERIC_ERROR_TEXT}>{error?.message}</ErrorAlert>;
  }

  const hasHandoffItems = standMatch.expectedHandoffItems.length > 0;
  const hasPickupItems = standMatch.expectedPickupItems.length > 0;

  return (
    <>
      <Title>
        <StandMatchTitle standMatch={standMatch} />
      </Title>

      {isFulfilled && (
        <SuccessAlert>
          Du har mottatt og levert alle bøkene for denne overleveringen.
        </SuccessAlert>
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

      <Stack align={"center"} w={"100%"}>
        <Button
          leftSection={<IconQrcode />}
          onClick={() =>
            modals.open({
              title: "Kunde-ID",
              children: (
                <Stack align={"center"} w={"100%"}>
                  <QRCode value={standMatch.customer} />
                  <Title>
                    Oppmøte{" "}
                    {dayjs(standMatch.meetingInfo?.date).format("HH:mm")}
                  </Title>
                  {tooEarly && (
                    <InfoAlert title={"For tidlig ute"}>
                      Din oppmøtetid har ikke kommet enda. Vent med å stille deg
                      i kø til tidspunktet du har fått tildelt.
                    </InfoAlert>
                  )}
                </Stack>
              ),
            })
          }
        >
          Vis kunde-ID
        </Button>
      </Stack>

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
