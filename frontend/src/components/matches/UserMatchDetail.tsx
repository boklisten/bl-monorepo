import { UserMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Button, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconObjectScan } from "@tabler/icons-react";
import { Suspense, useState } from "react";

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
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import SuccessAlert from "@/components/ui/alerts/SuccessAlert";
import WarningAlert from "@/components/ui/alerts/WarningAlert";
import useApiClient from "@/hooks/useApiClient";
import { GENERIC_ERROR_TEXT } from "@/utils/constants";

const UserMatchDetail = ({
  userMatch,
  currentUserId,
  handleItemTransferred,
}: {
  userMatch: UserMatchWithDetails;
  currentUserId: string;
  handleItemTransferred?: (() => void) | undefined;
}) => {
  const client = useApiClient();
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
    return <ErrorAlert title={GENERIC_ERROR_TEXT}>{error?.message}</ErrorAlert>;
  }

  return (
    <Stack gap={"xl"}>
      <Stack gap={"xs"}>
        <Title>
          <UserMatchTitle userMatchStatus={userMatchStatus} />
        </Title>

        {isCurrentUserFulfilled && (
          <>
            <SuccessAlert>
              Du har {statusText} alle bøkene for denne overleveringen.
            </SuccessAlert>
            {redirectCountdownStarted && (
              <Suspense>
                <CountdownToRedirect path={"/overleveringer"} seconds={5} />
              </Suspense>
            )}
          </>
        )}
        <ProgressBar
          percentComplete={
            (currentUserActualItemCount * 100) / currentUserExpectedItemCount
          }
          subtitle={
            <>
              {currentUserActualItemCount} av {currentUserExpectedItemCount}{" "}
              bøker {statusText}
            </>
          }
        />
      </Stack>
      {otherUser.receivedItems.some(
        (item) => !currentUser.deliveredItems.includes(item),
      ) && (
        <WarningAlert
          title={`${otherUser.name} har fått bøker som tilhørte noen andre enn deg`}
        >
          <Text>
            Hvis det var du som ga dem bøkene, betyr det at noen andre har bøker
            som opprinnelig tilhørte deg. Du er fortsatt ansvarlig for at de
            blir levert, men hvis noen andre leverer dem for deg vil de bli
            markert som levert. Hvis du ikke har gitt bort bøkene du har, betyr
            det at de har fått bøker av noen andre, og du må levere på stand i
            stedet.
          </Text>
        </WarningAlert>
      )}

      {!isCurrentUserFulfilled && (
        <>
          <Stack gap={"xs"}>
            <Title order={2}>Hvordan fungerer det?</Title>
            <Text>
              Du skal møte en annen elev og utveksle bøker. Det er viktig at den
              som mottar bøker scanner hver bok, hvis ikke blir ikke bøkene
              registrert som levert, og avsender kan få faktura. Hvis en bok er
              ødelagt, skal den ikke tas imot.
            </Text>
          </Stack>
          <Stack gap={"xs"}>
            <MatchHeader>Du skal møte</MatchHeader>
            <OtherPersonContact
              userMatch={userMatch}
              currentUserId={currentUserId}
            />
            <MeetingInfo
              meetingLocation={userMatch.meetingInfo.location}
              meetingTime={userMatch.meetingInfo.date}
            />
          </Stack>
        </>
      )}
      {currentUser.wantedItems.length > currentUser.receivedItems.length && (
        <Stack gap={"xs"}>
          <MatchHeader>Når du skal motta bøker</MatchHeader>
          <Text>For å motta bøker må du scanne dem</Text>
          <ScannerTutorial />
          <Button
            color={"green"}
            leftSection={<IconObjectScan />}
            onClick={() =>
              modals.open({
                title: "Skann bøker",
                children: (
                  <ScannerModal
                    allowManualRegistration
                    onScan={async (blid) => {
                      const response = await client.matches.transfer_item
                        .$post({ blid })
                        .unwrap();
                      return [{ feedback: response.feedback ?? "" }];
                    }}
                    onSuccessfulScan={() => {
                      handleItemTransferred?.();
                      if (isCurrentUserFulfilled) {
                        setRedirectCountdownStarted(true);
                        modals.closeAll();
                      }
                    }}
                  >
                    <MatchScannerContent
                      itemStatuses={itemStatuses}
                      expectedItems={currentUser.wantedItems}
                      fulfilledItems={currentUser.receivedItems}
                    />
                  </ScannerModal>
                ),
              })
            }
          >
            Scan bøker
          </Button>
        </Stack>
      )}
      {currentUser.wantedItems.length > 0 && (
        <Stack gap={0}>
          {!isCurrentUserFulfilled && (
            <MatchHeader>Du skal motta disse bøkene</MatchHeader>
          )}
          <MatchItemTable
            itemFilter={currentUser.wantedItems}
            itemStatuses={itemStatuses}
            isSender={false}
          />
        </Stack>
      )}
      {currentUser.items.length > 0 && (
        <Stack gap={0}>
          {!isCurrentUserFulfilled && (
            <MatchHeader>Du skal levere disse bøkene</MatchHeader>
          )}
          <MatchItemTable
            itemFilter={currentUser.items}
            itemStatuses={itemStatuses}
            isSender={true}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default UserMatchDetail;
