import { UserMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { useState } from "react";

import BlFetcher from "@/api/blFetcher";
import CountdownToRedirect from "@/components/CountdownToRedirect";
import {
  calculateUserMatchStatus,
  calculateItemStatuses,
  ItemStatus,
  MatchHeader,
} from "@/components/matches/matches-helper";
import { UserMatchTitle } from "@/components/matches/matchesList/helper";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MatchItemTable from "@/components/matches/MatchItemTable";
import MatchScannerContent from "@/components/matches/MatchScannerContent";
import MeetingInfo from "@/components/matches/MeetingInfo";
import OtherPersonContact from "@/components/matches/OtherPersonContact";
import ScannerModal from "@/components/scanner/ScannerModal";
import ScannerTutorial from "@/components/scanner/ScannerTutorial";
import BL_CONFIG from "@/utils/bl-config";

const UserMatchDetail = ({
  userMatch,
  currentUserId,
  handleItemTransferred,
}: {
  userMatch: UserMatchWithDetails;
  currentUserId: string;
  handleItemTransferred?: (() => void) | undefined;
}) => {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [redirectCountdownStarted, setRedirectCountdownStarted] =
    useState(false);
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
  const isCurrentUserFulfilled =
    currentUserActualItemCount >= currentUserExpectedItemCount;

  let itemStatuses: ItemStatus[];
  try {
    itemStatuses = calculateItemStatuses(
      userMatch,
      () => [currentUser.items, currentUser.wantedItems].flat(),
      [currentUser.receivedItems, currentUser.deliveredItems].flat(),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return <Alert severity="error">En feil oppstod: {error?.message}</Alert>;
  }

  return (
    <>
      <Typography variant="h1">
        <UserMatchTitle userMatchStatus={userMatchStatus} />
      </Typography>
      {isCurrentUserFulfilled && (
        <Box
          sx={{
            my: 2,
          }}
        >
          <Alert>
            Du har {statusText} alle bøkene for denne overleveringen.
          </Alert>
          {redirectCountdownStarted && (
            <CountdownToRedirect path={"/matches"} seconds={5} />
          )}
        </Box>
      )}
      <ProgressBar
        percentComplete={
          (currentUserActualItemCount * 100) / currentUserExpectedItemCount
        }
        subtitle={
          <>
            {currentUserActualItemCount} av {currentUserExpectedItemCount} bøker{" "}
            {statusText}
          </>
        }
      />
      {otherUser.receivedItems.some(
        (item) => !currentUser.deliveredItems.includes(item),
      ) && (
        <Alert severity="warning" sx={{ my: 2 }}>
          <AlertTitle>{`${otherUser.name} har fått bøker som tilhørte noen andre enn deg`}</AlertTitle>
          <Typography paragraph>
            Hvis det var du som ga dem bøkene, betyr det at noen andre har bøker
            som opprinnelig tilhørte deg. Du er fortsatt ansvarlig for at de
            blir levert, men hvis noen andre leverer dem for deg vil de bli
            markert som levert.
          </Typography>
          <Typography>
            Hvis du ikke har gitt bort bøkene du har, betyr det at de har fått
            bøker av noen andre, og du må levere på stand i stedet.
          </Typography>
        </Alert>
      )}
      {!isCurrentUserFulfilled && (
        <>
          <Box sx={{ my: 2 }}>
            <Typography variant="h2">Hvordan fungerer det?</Typography>
            <Typography>
              Du skal møte en annen elev og utveksle bøker. Det er viktig at den
              som mottar bøker scanner hver bok, hvis ikke blir ikke bøkene
              registrert som levert, og avsender kan få faktura. Hvis en bok er
              ødelagt, skal den ikke tas imot.
            </Typography>
          </Box>
          <MatchHeader>Du skal møte</MatchHeader>
          <OtherPersonContact
            userMatch={userMatch}
            currentUserId={currentUserId}
          />
          <MeetingInfo
            meetingLocation={userMatch.meetingInfo.location}
            meetingTime={userMatch.meetingInfo.date}
          />
        </>
      )}
      {currentUser.wantedItems.length > currentUser.receivedItems.length && (
        <>
          <MatchHeader>Når du skal motta bøker</MatchHeader>
          <Typography sx={{ mb: 1 }}>
            For å motta bøker må du scanne dem
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <ScannerTutorial />
            <Button
              color="success"
              startIcon={<QrCodeScannerIcon />}
              variant={"contained"}
              onClick={() => setScanModalOpen(true)}
            >
              Scan bøker
            </Button>
          </Box>
        </>
      )}
      {currentUser.wantedItems.length > 0 && (
        <>
          {!isCurrentUserFulfilled && (
            <MatchHeader>Du skal motta disse bøkene</MatchHeader>
          )}
          <MatchItemTable
            itemFilter={currentUser.wantedItems}
            itemStatuses={itemStatuses}
            isSender={false}
          />
        </>
      )}
      {currentUser.items.length > 0 && (
        <>
          {!isCurrentUserFulfilled && (
            <MatchHeader>Du skal levere disse bøkene</MatchHeader>
          )}
          <MatchItemTable
            itemFilter={currentUser.items}
            itemStatuses={itemStatuses}
            isSender={true}
          />
        </>
      )}
      <ScannerModal
        allowManualRegistration
        onScan={(blid) =>
          BlFetcher.post(BL_CONFIG.collection.userMatches + "/transfer-item", {
            blid,
          })
        }
        open={scanModalOpen}
        handleSuccessfulScan={handleItemTransferred}
        handleClose={() => {
          setScanModalOpen(false);
          setRedirectCountdownStarted(isCurrentUserFulfilled);
        }}
      >
        <MatchScannerContent
          handleClose={() => {
            setScanModalOpen(false);
            setRedirectCountdownStarted(isCurrentUserFulfilled);
          }}
          scannerOpen={scanModalOpen}
          itemStatuses={itemStatuses}
          expectedItems={currentUser.wantedItems}
          fulfilledItems={currentUser.receivedItems}
        />
      </ScannerModal>
    </>
  );
};

export default UserMatchDetail;
