import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
} from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { FC, PropsWithChildren } from "react";

import DynamicLink from "@/components/DynamicLink";

const MatchListItemBox: FC<
  PropsWithChildren<{
    finished: boolean;
    matchId: string;
    matchType: "stand" | "user";
  }>
> = ({ finished, matchId, matchType, children }) => {
  return (
    <Card
      variant={finished ? "outlined" : "elevation"}
      elevation={finished ? 0 : 8}
      sx={{ backgroundColor: finished ? green["50"] : grey["100"] }}
    >
      <DynamicLink
        href={`/overleveringer/${matchType}/${matchId}`}
        color={"textPrimary"}
        underline={"none"}
      >
        <CardActionArea>
          <CardContent>{children}</CardContent>
          <CardActions>
            <Button
              component={"span"}
              size="small"
              variant={finished ? "text" : "contained"}
              sx={{ width: "100%" }}
              color="success"
            >
              Åpne
            </Button>
          </CardActions>
        </CardActionArea>
      </DynamicLink>
    </Card>
  );
};

export default MatchListItemBox;
