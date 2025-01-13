import StandMatchListItem from "@frontend/components/matches/matchesList/StandMatchListItem";
import UserMatchListItem from "@frontend/components/matches/matchesList/UserMatchListItem";
import { Typography, Box } from "@mui/material";
import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@shared/match/match-dtos";
import { FC } from "react";

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
