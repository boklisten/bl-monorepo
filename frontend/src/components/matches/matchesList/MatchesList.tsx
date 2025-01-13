import BlFetcher from "@frontend/api/blFetcher";
import { getAccessTokenBody } from "@frontend/api/token";
import {
  isStandMatchFulfilled,
  isUserMatchFulfilled,
} from "@frontend/components/matches/matches-helper";
import { MatchListItemGroups } from "@frontend/components/matches/matchesList/MatchListItemGroups";
import ProgressBar from "@frontend/components/matches/matchesList/ProgressBar";
import BL_CONFIG from "@frontend/utils/bl-config";
import { Alert, Skeleton } from "@mui/material";
import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@shared/match/match-dtos";
import { FC } from "react";
import useSWR from "swr";

export const MatchesList: FC = () => {
  const { data: accessToken, error: tokenError } = useSWR("userId", () =>
    getAccessTokenBody(),
  );
  const customer = accessToken?.details;

  const { data: userMatches, error: userMatchesError } = useSWR(
    `${BL_CONFIG.collection.userMatches}/me`,
    BlFetcher.get<UserMatchWithDetails[]>,
    { refreshInterval: 5000 },
  );
  const { data: standMatches, error: standMatchesError } = useSWR(
    `${BL_CONFIG.collection.standMatches}/me`,
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

  const unfulfilledUserMatches = sortedUserMatches.filter(
    (userMatch) =>
      !isUserMatchFulfilled(userMatch, userMatch.customerA === customer),
  );
  const fulfilledUserMatches = sortedUserMatches.filter((userMatch) =>
    isUserMatchFulfilled(userMatch, userMatch.customerA === customer),
  );

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
