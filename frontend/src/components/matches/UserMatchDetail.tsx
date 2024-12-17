import BlFetcher from "@frontend/api/blFetcher";
import CountdownToRedirect from "@frontend/components/CountdownToRedirect";
import {
  calculateFulfilledUserMatchItems,
  calculateItemStatuses,
  ItemStatus,
  MatchHeader,
} from "@frontend/components/matches/matches-helper";
import { UserMatchTitle } from "@frontend/components/matches/matchesList/helper";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import MatchItemTable from "@frontend/components/matches/MatchItemTable";
import MatchScannerContent from "@frontend/components/matches/MatchScannerContent";
import MeetingInfo from "@frontend/components/matches/MeetingInfo";
import OtherPersonContact from "@frontend/components/matches/OtherPersonContact";
import ScannerModal from "@frontend/components/scanner/ScannerModal";
import ScannerTutorial from "@frontend/components/scanner/ScannerTutorial";
import BL_CONFIG from "@frontend/utils/bl-config";
import { UserMatchWithDetails } from "@frontend/utils/types";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { useState } from "react";

const UserMatchDetail = ({
  match,
  currentUserId,
  handleItemTransferred,
}: {
  match: UserMatchWithDetails;
  currentUserId: string;
  handleItemTransferred?: (() => void) | undefined;
}) => {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [redirectCountdownStarted, setRedirectCountdownStarted] =
    useState(false);
  const isSender = match.sender === currentUserId;
  const fulfilledItems = calculateFulfilledUserMatchItems(match, isSender);
  const otherPersonFulfilledItems = calculateFulfilledUserMatchItems(
    match,
    !isSender,
  );
  const isFulfilled = fulfilledItems.length >= match.expectedItems.length;

  let itemStatuses: ItemStatus[];
  try {
    itemStatuses = calculateItemStatuses(
      match,
      (match) => match.expectedItems,
      fulfilledItems,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return <Alert severity="error">En feil oppstod: {error?.message}</Alert>;
  }

  return (
    <>
      <Typography variant="h1">
        <UserMatchTitle match={match} isSender={isSender} />
      </Typography>
      {isFulfilled && (
        <Box
          sx={{
            my: 2,
          }}
        >
          <Alert>
            Du har {isSender ? "levert" : "mottatt"} alle bøkene for denne
            overleveringen.
          </Alert>
          {redirectCountdownStarted && (
            <CountdownToRedirect path={"/matches"} seconds={5} />
          )}
        </Box>
      )}
      <ProgressBar
        percentComplete={
          (fulfilledItems.length * 100) / match.expectedItems.length
        }
        subtitle={
          <>
            {fulfilledItems.length} av {match.expectedItems.length} bøker{" "}
            {isSender ? "levert" : "mottatt"}
          </>
        }
      />
      {isSender &&
        otherPersonFulfilledItems.some(
          (item) => !fulfilledItems.includes(item),
        ) && (
          <Alert severity="warning" sx={{ my: 2 }}>
            <AlertTitle>{`${match.receiverDetails.name} har fått bøker som tilhørte noen andre enn deg`}</AlertTitle>
            <Typography paragraph>
              Hvis det var du som ga dem bøkene, betyr det at noen andre har
              bøker som opprinnelig tilhørte deg. Du er fortsatt ansvarlig for
              at de blir levert, men hvis noen andre leverer dem for deg vil de
              bli markert som levert.
            </Typography>
            <Typography>
              Hvis du ikke har gitt bort bøkene du har, betyr det at de har fått
              bøker av noen andre, og du må levere på stand i stedet.
            </Typography>
          </Alert>
        )}
      {!isFulfilled && (
        <>
          <Box sx={{ my: 2 }}>
            <Typography variant="h2">Hvordan fungerer det?</Typography>
            <Typography>
              Du skal møte en annen elev og utveksle bøker. Det er viktig at den
              som mottar bøker scanner hver bok, hvis ikke blir ikke bøkene
              registrert som levert, og avsender kan få faktura.
              {!isSender && " Hvis en bok er ødelagt, ikke ta den imot."}
            </Typography>
          </Box>
          <MatchHeader>Du skal møte</MatchHeader>
          <MeetingInfo match={match} />
          <OtherPersonContact match={match} currentUserId={currentUserId} />
        </>
      )}
      {!isSender && !isFulfilled && (
        <>
          <MatchHeader>Når du skal motta bøkene</MatchHeader>
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
      {!isFulfilled && (
        <MatchHeader>
          Du skal {isSender ? "levere" : "motta"} disse bøkene
        </MatchHeader>
      )}
      <MatchItemTable itemStatuses={itemStatuses} isSender={isSender} />
      <ScannerModal
        onScan={(blid) =>
          BlFetcher.post(BL_CONFIG.collection.match + "/transfer-item", {
            blid,
          })
        }
        open={scanModalOpen}
        handleSuccessfulScan={handleItemTransferred}
        handleClose={() => {
          setScanModalOpen(false);
          setRedirectCountdownStarted(isFulfilled);
        }}
      >
        <MatchScannerContent
          handleClose={() => {
            setScanModalOpen(false);
            setRedirectCountdownStarted(isFulfilled);
          }}
          scannerOpen={scanModalOpen}
          itemStatuses={itemStatuses}
          expectedItems={match.expectedItems}
          fulfilledItems={fulfilledItems}
        />
      </ScannerModal>
    </>
  );
};

export default UserMatchDetail;
