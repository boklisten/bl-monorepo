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
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { UserMatchWithDetails } from "@shared/match/match-dtos";
import { useState } from "react";

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
  const isCustomerA = userMatch.customerA === currentUserId;
  const customerAFulfilledItems = calculateFulfilledUserMatchItems(
    userMatch,
    isCustomerA,
  );
  const customerBFulfilledItems = calculateFulfilledUserMatchItems(
    userMatch,
    !isCustomerA,
  );

  const customerFulfilledItems = isCustomerA
    ? customerAFulfilledItems
    : customerBFulfilledItems;
  const otherFulfilledItems = isCustomerA
    ? customerBFulfilledItems
    : customerAFulfilledItems;

  const receiveItems = isCustomerA
    ? userMatch.expectedBToAItems
    : userMatch.expectedAToBItems;
  const deliveryItems = isCustomerA
    ? userMatch.expectedAToBItems
    : userMatch.expectedBToAItems;

  const isFulfilled =
    customerFulfilledItems.length >=
    userMatch.expectedAToBItems.length + userMatch.expectedBToAItems.length;

  let itemStatuses: ItemStatus[];
  try {
    itemStatuses = calculateItemStatuses(
      userMatch,
      (userMatch) =>
        [userMatch.expectedAToBItems, userMatch.expectedBToAItems].flat(),
      customerAFulfilledItems,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return <Alert severity="error">En feil oppstod: {error?.message}</Alert>;
  }

  let statusText = "";
  if (
    (isCustomerA &&
      userMatch.expectedAToBItems.length > 0 &&
      userMatch.expectedBToAItems.length === 0) ||
    (!isCustomerA &&
      userMatch.expectedBToAItems.length > 0 &&
      userMatch.expectedAToBItems.length === 0)
  ) {
    statusText = "levert";
  } else if (
    (isCustomerA &&
      userMatch.expectedBToAItems.length > 0 &&
      userMatch.expectedAToBItems.length === 0) ||
    (!isCustomerA &&
      userMatch.expectedAToBItems.length > 0 &&
      userMatch.expectedBToAItems.length === 0)
  ) {
    statusText = "mottatt";
  } else {
    statusText = "utvekslet";
  }
  const expectedItemsCount =
    userMatch.expectedAToBItems.length + userMatch.expectedBToAItems.length;

  return (
    <>
      <Typography variant="h1">
        <UserMatchTitle userMatch={userMatch} isCustomerA={isCustomerA} />
      </Typography>
      {isFulfilled && (
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
          (customerFulfilledItems.length * 100) / expectedItemsCount
        }
        subtitle={
          <>
            {customerFulfilledItems.length} av {expectedItemsCount} bøker{" "}
            {statusText}
          </>
        }
      />
      {customerFulfilledItems.some(
        (item) => !otherFulfilledItems.includes(item),
      ) && (
        <Alert severity="warning" sx={{ my: 2 }}>
          <AlertTitle>{`${isCustomerA ? userMatch.customerBDetails.name : userMatch.customerADetails.name} har fått bøker som tilhørte noen andre enn deg`}</AlertTitle>
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
      {!isFulfilled && (
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
      {receiveItems.length > 0 && !isFulfilled && (
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
      {receiveItems.length > 0 && (
        <>
          {!isFulfilled && (
            <MatchHeader>Du skal motta disse bøkene</MatchHeader>
          )}
          <MatchItemTable
            itemFilter={receiveItems}
            itemStatuses={itemStatuses}
            isSender={deliveryItems.length > 0}
          />
        </>
      )}
      {deliveryItems.length > 0 && (
        <>
          {!isFulfilled && (
            <MatchHeader>Du skal levere disse bøkene</MatchHeader>
          )}
          <MatchItemTable
            itemFilter={deliveryItems}
            itemStatuses={itemStatuses}
            isSender={deliveryItems.length > 0}
          />
        </>
      )}
      <ScannerModal
        onScan={(blid) =>
          BlFetcher.post(BL_CONFIG.collection.userMatches + "/transfer-item", {
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
          expectedItems={receiveItems}
          fulfilledItems={customerAFulfilledItems}
        />
      </ScannerModal>
    </>
  );
};

export default UserMatchDetail;
