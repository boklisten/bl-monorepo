import DynamicLink from "@frontend/components/DynamicLink";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
} from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { FC, PropsWithChildren } from "react";

const MatchListItemBox: FC<
  PropsWithChildren<{ finished: boolean; matchId: string }>
> = ({ finished, matchId, children }) => {
  return (
    <Card
      variant={finished ? "outlined" : "elevation"}
      elevation={finished ? 0 : 8}
      sx={{ backgroundColor: finished ? green["50"] : grey["100"] }}
    >
      <CardActionArea component={DynamicLink} href={`/matches/${matchId}`}>
        <CardContent>{children}</CardContent>
        <CardActions>
          <Button
            component={DynamicLink}
            href={`/matches/${matchId}`}
            size="small"
            variant={finished ? "text" : "contained"}
            sx={{ width: "100%" }}
            color="success"
          >
            Åpne
          </Button>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

export default MatchListItemBox;
