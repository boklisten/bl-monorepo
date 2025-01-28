import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@boklisten/backend/shared/match/match-dtos";
import { Typography, Box } from "@mui/material";
import { FC } from "react";

import StandMatchListItem from "@/components/matches/matchesList/StandMatchListItem";
import UserMatchListItem from "@/components/matches/matchesList/UserMatchListItem";

export const MatchListItemGroups: FC<{
  userMatches: UserMatchWithDetails[];
  standMatch?: StandMatchWithDetails | undefined;
  userId: string;
  heading?: string;
}> = ({ userMatches, standMatch, userId, heading }) => {
  return (
    <Box
      component={"section"}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        marginTop: 2,
      }}
    >
      {heading && <Typography variant="h2">{heading}</Typography>}
      {userMatches.map((match) => (
        <UserMatchListItem
          key={match.id}
          userMatch={match}
          currentUserId={userId}
        />
      ))}
      {standMatch && (
        <StandMatchListItem standMatch={standMatch} currentUserId={userId} />
      )}
    </Box>
  );
};
