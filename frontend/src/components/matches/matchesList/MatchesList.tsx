import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@boklisten/backend/shared/match/match-dtos";
import { Alert, Skeleton } from "@mui/material";
import { FC } from "react";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import {
  calculateUserMatchStatus,
  isStandMatchFulfilled,
} from "@/components/matches/matches-helper";
import { MatchListItemGroups } from "@/components/matches/matchesList/MatchListItemGroups";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import useApiClient from "@/utils/api/useApiClient";

export const MatchesList: FC = () => {
  const { client } = useApiClient();
  const { data: accessToken, error: tokenError } = useSWR("userId", () =>
    getAccessTokenBody(),
  );
  const customer = accessToken?.details;

  const { data: userMatches, error: userMatchesError } = useSWR(
    client.$url("collection.user_matches.operation.me.getAll"),
    BlFetcher.get<UserMatchWithDetails[]>,
    { refreshInterval: 5000 },
  );
  const { data: standMatches, error: standMatchesError } = useSWR(
    client.$url("collection.stand_matches.getAll"),
    BlFetcher.get<StandMatchWithDetails[]>,
    { refreshInterval: 5000 },
  );

  if (!customer || tokenError || userMatchesError || standMatchesError) {
    return <Alert severity="error">En feil har oppstått.</Alert>;
  }

  if (userMatches === undefined || standMatches === undefined) {
    return <Skeleton />;
  }
  const sortedUserMatches = userMatches.sort((a, b) => {
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

  if (userMatches.length === 0 && standMatches.length === 0) {
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

  const standMatch = standMatches[0];
  const showMatchList =
    unfulfilledUserMatches.length > 0 || standMatch !== undefined;

  return (
    <>
      <ProgressBar
        percentComplete={
          (100 *
            (fulfilledUserMatches.length +
              (isStandMatchFulfilled(standMatch) ? 1 : 0))) /
          (userMatches.length + (standMatch !== undefined ? 1 : 0))
        }
        subtitle={
          <span>
            Fullført{" "}
            {fulfilledUserMatches.length +
              (isStandMatchFulfilled(standMatch) ? 1 : 0)}{" "}
            av {userMatches.length + (standMatch !== undefined ? 1 : 0)}{" "}
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
