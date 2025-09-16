"use client";
import { Anchor, Box, Button, Skeleton } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import StandMatchDetail from "@/features/matches/StandMatchDetail";
import UserMatchDetail from "@/features/matches/UserMatchDetail";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  GENERIC_ERROR_TEXT,
  PLEASE_TRY_AGAIN_TEXT,
} from "@/shared/utils/constants";

const MatchDetail = ({
  userMatchId,
  standMatchId,
}: {
  userMatchId?: string;
  standMatchId?: string;
}) => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [client.matches.me.$url()],
    queryFn: () => client.matches.me.$get().unwrap(),
    staleTime: 5000,
  });

  if (isLoading) {
    return <Skeleton height={500} />;
  }

  if (isError || !data) {
    return (
      <ErrorAlert title={GENERIC_ERROR_TEXT}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  const userMatch = data.userMatches.find(
    (userMatch) => userMatch.id === userMatchId,
  );
  if (data.userMatches && userMatchId && !userMatch) {
    return (
      <ErrorAlert>
        Kunne ikke finne en elevoverlevering med ID {userMatchId}.
      </ErrorAlert>
    );
  }
  const standMatch = standMatchId ? data.standMatch : undefined;
  if (standMatchId && !standMatch) {
    return (
      <ErrorAlert>
        Kunne ikke finne en standoverlevering med ID {standMatchId}.
      </ErrorAlert>
    );
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
          handleItemTransferred={() =>
            queryClient.invalidateQueries({
              queryKey: [client.matches.me.$url()],
            })
          }
        />
      )}
    </>
  );
};

export default MatchDetail;
