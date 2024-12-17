"use client";
import { MatchVariant, MatchWithDetails } from "@boklisten/bl-model";
import { ArrowBack } from "@mui/icons-material";
import { Alert, Button, Card, Container, Skeleton } from "@mui/material";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import StandMatchDetail from "@/components/matches/StandMatchDetail";
import UserMatchDetail from "@/components/matches/UserMatchDetail";
import BL_CONFIG from "@/utils/bl-config";
import theme from "@/utils/theme";

const MatchDetail = ({ matchId }: { matchId: string }) => {
  const { data: accessToken, error: tokenError } = useSWR("userId", () =>
    getAccessTokenBody(),
  );
  const userId = accessToken?.details;

  const {
    data: matches,
    error: matchesError,
    mutate: updateMatches,
  } = useSWR(
    `${BL_CONFIG.collection.match}/me`,
    BlFetcher.get<MatchWithDetails[]>,
    { refreshInterval: 5000 },
  );

  if (tokenError || matchesError) {
    return (
      <Alert severity="error">
        En feil har oppstått. Ta kontakt med info@boklisten.no dersom problemet
        vedvarer.
      </Alert>
    );
  }

  const match = matches?.find((match) => match.id === matchId);
  if (matches && !match) {
    return (
      <Alert severity="error">
        Kunne ikke finne en overlevering med ID {matchId}.
      </Alert>
    );
  }

  if (!userId || !match) {
    return <Skeleton />;
  }

  return (
    <Card sx={{ padding: theme.spacing(2, 0, 4, 0) }}>
      <Container>
        <DynamicLink
          href={`/${BL_CONFIG.collection.match}`}
          sx={{ marginBottom: 2, display: "inline-block" }}
        >
          <Button startIcon={<ArrowBack />}>Alle overleveringer</Button>
        </DynamicLink>

        {match._variant === MatchVariant.StandMatch && (
          <StandMatchDetail match={match} />
        )}
        {match._variant === MatchVariant.UserMatch && (
          <UserMatchDetail
            match={match}
            currentUserId={userId}
            handleItemTransferred={() => updateMatches()}
          />
        )}
      </Container>
    </Card>
  );
};

export default MatchDetail;
