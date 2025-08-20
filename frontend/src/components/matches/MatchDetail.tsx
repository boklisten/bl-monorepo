"use client";
import { ArrowBack } from "@mui/icons-material";
import { Alert, Button, Card, Container, Skeleton } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

  if (tokenError || matchesError) {
    return (
      <Alert severity="error">
        En feil har oppstått. Ta kontakt med info@boklisten.no dersom problemet
        vedvarer.
      </Alert>
    );
  }

  const userMatch = matches?.userMatches.find(
    (userMatch) => userMatch.id === userMatchId,
  );
  if (matches?.userMatches && userMatchId && !userMatch) {
    return (
      <Alert severity="error">
        Kunne ikke finne en elevoverlevering med ID {userMatchId}.
      </Alert>
    );
  }
  const standMatch = standMatchId ? matches?.standMatch : undefined;
  if (standMatchId && !standMatch) {
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
          href={`/overleveringer`}
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
                  client.matches
                    .get({ detailsId: getAccessTokenBody().details })
                    .$url(),
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
