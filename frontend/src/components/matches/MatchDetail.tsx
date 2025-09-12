"use client";
import { Anchor, Box, Button, Skeleton } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { getAccessTokenBody } from "@/api/token";
import StandMatchDetail from "@/components/matches/StandMatchDetail";
import UserMatchDetail from "@/components/matches/UserMatchDetail";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import useApiClient from "@/hooks/useApiClient";
import { GENERIC_ERROR_TEXT, PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";

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
    return <Skeleton height={500} />;
  }

  return (
    <>
      <Box>
        <Anchor component={Link} href={"/overleveringer"}>
          <Button variant={"subtle"} leftSection={<IconArrowLeft />}>
            Alle overleveringer
          </Button>
        </Anchor>
      </Box>

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
    </>
  );
};

export default MatchDetail;
