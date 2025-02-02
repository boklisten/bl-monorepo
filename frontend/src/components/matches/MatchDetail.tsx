"use client";
import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@boklisten/backend/shared/match/match-dtos";
import { ArrowBack } from "@mui/icons-material";
import { Alert, Button, Card, Container, Skeleton } from "@mui/material";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import StandMatchDetail from "@/components/matches/StandMatchDetail";
import UserMatchDetail from "@/components/matches/UserMatchDetail";
import useApiClient from "@/utils/api/useApiClient";
import theme from "@/utils/theme";

const MatchDetail = ({
  userMatchId,
  standMatchId,
}: {
  userMatchId?: string;
  standMatchId?: string;
}) => {
  const { client } = useApiClient();
  const { data: accessToken, error: tokenError } = useSWR("userId", () =>
    getAccessTokenBody(),
  );
  const userId = accessToken?.details;

  const {
    data: userMatches,
    error: userMatchesError,
    mutate: updateUserMatches,
  } = useSWR(
    client.$url("collection.user_matches.operation.me.getAll"),
    BlFetcher.get<UserMatchWithDetails[]>,
    { refreshInterval: 5000 },
  );
  const { data: standMatches, error: standMatchesError } = useSWR(
    client.$url("collection.stand_matches.operation.me.getAll"),
    BlFetcher.get<StandMatchWithDetails[]>,
    { refreshInterval: 5000 },
  );

  if (tokenError || userMatchesError || standMatchesError) {
    return (
      <Alert severity="error">
        En feil har oppstått. Ta kontakt med info@boklisten.no dersom problemet
        vedvarer.
      </Alert>
    );
  }

  const userMatch = userMatches?.find(
    (userMatch) => userMatch.id === userMatchId,
  );
  if (userMatches && userMatchId && !userMatch) {
    return (
      <Alert severity="error">
        Kunne ikke finne en elevoverlevering med ID {userMatchId}.
      </Alert>
    );
  }
  const standMatch = standMatches?.find(
    (standMatch) => standMatch.id === standMatchId,
  );
  if (standMatches && standMatchId && !standMatch) {
    return (
      <Alert severity="error">
        Kunne ikke finne en standoverlevering med ID {standMatchId}.
      </Alert>
    );
  }

  if (!userId || (userMatchId && !userMatch) || (standMatchId && !standMatch)) {
    return <Skeleton />;
  }

  return (
    <Card sx={{ padding: theme.spacing(2, 0, 4, 0) }}>
      <Container>
        <DynamicLink
          href={`/matches`}
          sx={{ marginBottom: 2, display: "inline-block" }}
        >
          <Button startIcon={<ArrowBack />}>Alle overleveringer</Button>
        </DynamicLink>

        {standMatch && <StandMatchDetail standMatch={standMatch} />}
        {userMatch && (
          <UserMatchDetail
            userMatch={userMatch}
            currentUserId={userId}
            handleItemTransferred={() => updateUserMatches()}
          />
        )}
      </Container>
    </Card>
  );
};

export default MatchDetail;
