"use client";
import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@boklisten/backend/shared/match/match-dtos";
import { ArrowBack } from "@mui/icons-material";
import { Alert, Button, Card, Container, Skeleton } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const client = useApiClient();
  const queryClient = useQueryClient();
  const { data: accessToken, error: tokenError } = useQuery({
    queryKey: ["userId"],
    queryFn: () => getAccessTokenBody(),
  });
  const userId = accessToken?.details;

  const { data: userMatches, error: userMatchesError } = useQuery({
    queryKey: [client.$url("collection.user_matches.operation.me.getAll")],
    queryFn: ({ queryKey }) =>
      BlFetcher.get<UserMatchWithDetails[]>(queryKey[0] ?? ""),
    staleTime: 5000,
  });

  const { data: standMatches, error: standMatchesError } = useQuery({
    queryKey: [client.$url("collection.stand_matches.operation.me.getAll")],
    queryFn: ({ queryKey }) =>
      BlFetcher.get<StandMatchWithDetails[]>(queryKey[0] ?? ""),
    staleTime: 5000,
  });

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
            handleItemTransferred={() =>
              queryClient.invalidateQueries({
                queryKey: [
                  client.$url("collection.user_matches.operation.me.getAll"),
                ],
              })
            }
          />
        )}
      </Container>
    </Card>
  );
};

export default MatchDetail;
