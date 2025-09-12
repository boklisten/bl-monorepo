"use client";
import { ArrowBack } from "@mui/icons-material";
import { Button, Card, Container, Skeleton } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getAccessTokenBody } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import StandMatchDetail from "@/components/matches/StandMatchDetail";
import UserMatchDetail from "@/components/matches/UserMatchDetail";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import useApiClient from "@/hooks/useApiClient";
import { GENERIC_ERROR_TEXT, PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import muiTheme from "@/utils/muiTheme";

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
      <ErrorAlert title={GENERIC_ERROR_TEXT}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  const userMatch = matches?.userMatches.find(
    (userMatch) => userMatch.id === userMatchId,
  );
  if (matches?.userMatches && userMatchId && !userMatch) {
    return (
      <ErrorAlert>
        Kunne ikke finne en elevoverlevering med ID {userMatchId}.
      </ErrorAlert>
    );
  }
  const standMatch = standMatchId ? matches?.standMatch : undefined;
  if (standMatchId && !standMatch) {
    return (
      <ErrorAlert>
        Kunne ikke finne en standoverlevering med ID {standMatchId}.
      </ErrorAlert>
    );
  }

  if (!userId || (userMatchId && !userMatch) || (standMatchId && !standMatch)) {
    return <Skeleton />;
  }

  return (
    <Card sx={{ padding: muiTheme.spacing(2, 0, 4, 0) }}>
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
