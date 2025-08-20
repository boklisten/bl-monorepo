"use client";
import { Alert, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import { getAccessTokenBody } from "@/api/token";
import {
  calculateUserMatchStatus,
  isStandMatchFulfilled,
} from "@/components/matches/matches-helper";
import { MatchListItemGroups } from "@/components/matches/matchesList/MatchListItemGroups";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import useApiClient from "@/utils/api/useApiClient";

export const MatchesList: FC = () => {
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
    return <Alert severity="error">En feil har oppstått.</Alert>;
  }

  if (matches === undefined) {
    return <Skeleton />;
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
      <Alert severity="info">
        Du har ingen overleveringer :)
        <p>
          Har du fått melding om overleveringer? Sjekk om du er logget inn med
          riktig konto.
        </p>
        <p>Ta kontakt med info@boklisten.no om du har spørsmål.</p>
      </Alert>
    );
  }

  const standMatch = matches.standMatch;
  const showMatchList =
    unfulfilledUserMatches.length > 0 || standMatch !== undefined;

  return (
    <>
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
    </>
  );
};
