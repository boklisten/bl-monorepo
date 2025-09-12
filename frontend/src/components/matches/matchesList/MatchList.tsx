"use client";
import { Skeleton, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { getAccessTokenBody } from "@/api/token";
import {
  calculateUserMatchStatus,
  isStandMatchFulfilled,
} from "@/components/matches/matches-helper";
import MatchListItemGroups from "@/components/matches/matchesList/MatchListItemGroups";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import InfoAlert from "@/components/ui/alerts/InfoAlert";
import useApiClient from "@/hooks/useApiClient";

export default function MatchList() {
  const client = useApiClient();
  const { data: accessToken, error: tokenError } = useQuery({
    queryKey: ["userId"],
    queryFn: () => getAccessTokenBody(),
  });
  const customer = accessToken?.details;
  const { data: matches, error: matchesError } = useQuery({
    queryKey: [
      client.matches.get({ detailsId: getAccessTokenBody().details }).$url(),
    ],
    queryFn: () =>
      client.matches
        .get({ detailsId: getAccessTokenBody().details })
        .$get()
        .unwrap(),
    staleTime: 5000,
  });

  if (!customer || tokenError || matchesError) {
    return (
      <ErrorAlert
        title={"Klarte ikke laste inn dine overleveringer"}
      ></ErrorAlert>
    );
  }

  if (matches === undefined) {
    return <Skeleton height={110} />;
  }

  const sortedUserMatches = matches.userMatches.sort((a, b) => {
    if (!a.meetingInfo.date) {
      return b.meetingInfo.date ? 1 : 0;
    } else if (!b.meetingInfo.date) {
      return -1;
    }

    if (a.meetingInfo.date > b.meetingInfo.date) return 1;
    if (a.meetingInfo.date < b.meetingInfo.date) return -1;

    return 0;
  });

  const unfulfilledUserMatches = sortedUserMatches.filter((userMatch) => {
    const { currentUser } = calculateUserMatchStatus(userMatch, customer);
    const currentUserExpectedItemCount =
      currentUser.items.length + currentUser.wantedItems.length;
    const currentUserActualItemCount =
      currentUser.deliveredItems.length + currentUser.receivedItems.length;
    return currentUserActualItemCount < currentUserExpectedItemCount;
  });
  const fulfilledUserMatches = sortedUserMatches.filter((userMatch) => {
    const { currentUser } = calculateUserMatchStatus(userMatch, customer);
    const currentUserExpectedItemCount =
      currentUser.items.length + currentUser.wantedItems.length;
    const currentUserActualItemCount =
      currentUser.deliveredItems.length + currentUser.receivedItems.length;
    return currentUserActualItemCount >= currentUserExpectedItemCount;
  });

  if (matches.userMatches.length === 0 && matches.standMatch === undefined) {
    return (
      <InfoAlert title={"Du har ingen overleveringer :)"}>
        <Stack gap={"xs"}>
          <Text size={"sm"}>
            Har du fått melding om overleveringer? Sjekk om du er logget inn med
            riktig konto.
          </Text>
          <Text size={"sm"}>
            Ta kontakt med info@boklisten.no om du har spørsmål.
          </Text>
        </Stack>
      </InfoAlert>
    );
  }

  const standMatch = matches.standMatch;
  const showMatchList =
    unfulfilledUserMatches.length > 0 || standMatch !== undefined;

  return (
    <Stack gap={"xl"}>
      <ProgressBar
        percentComplete={
          (100 *
            (fulfilledUserMatches.length +
              (isStandMatchFulfilled(standMatch) ? 1 : 0))) /
          (matches.userMatches.length + (standMatch !== undefined ? 1 : 0))
        }
        subtitle={
          <span>
            Fullført{" "}
            {fulfilledUserMatches.length +
              (isStandMatchFulfilled(standMatch) ? 1 : 0)}{" "}
            av {matches.userMatches.length + (standMatch !== undefined ? 1 : 0)}{" "}
            overleveringer
          </span>
        }
      />

      {showMatchList && (
        <MatchListItemGroups
          userMatches={unfulfilledUserMatches}
          standMatch={standMatch}
          userId={customer}
        />
      )}
      {fulfilledUserMatches.length > 0 && (
        <MatchListItemGroups
          userMatches={fulfilledUserMatches}
          userId={customer}
          heading="Fullførte overleveringer"
        />
      )}
    </Stack>
  );
}
