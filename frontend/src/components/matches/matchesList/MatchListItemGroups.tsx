import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@boklisten/backend/shared/match/match-dtos";
import { Stack, Title } from "@mantine/core";

import StandMatchListItem from "@/components/matches/matchesList/StandMatchListItem";
import UserMatchListItem from "@/components/matches/matchesList/UserMatchListItem";

export default function MatchListItemGroups({
  userMatches,
  standMatch,
  userId,
  heading,
}: {
  userMatches: UserMatchWithDetails[];
  standMatch?: StandMatchWithDetails | undefined;
  userId: string;
  heading?: string;
}) {
  return (
    <Stack>
      {heading && <Title order={2}>{heading}</Title>}
      {userMatches.map((match) => (
        <UserMatchListItem
          key={match.id}
          userMatch={match}
          currentUserId={userId}
        />
      ))}
      {standMatch && <StandMatchListItem standMatch={standMatch} />}
    </Stack>
  );
}
