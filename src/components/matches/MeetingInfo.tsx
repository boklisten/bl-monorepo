import { MatchWithDetails } from "@boklisten/bl-model";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Box, Typography } from "@mui/material";

import DynamicLink from "@/components/DynamicLink";
import { FormattedDatetime } from "@/components/matches/matchesList/helper";

const MeetingInfo = ({ match }: { match: MatchWithDetails }) => {
  const meetingTime = match.meetingInfo.date;
  const meetingLocation = match.meetingInfo.location;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        my: 0.4,
        fontSize: "inherit",
      }}
    >
      <Box sx={{ display: "flex", marginTop: 0.4, alignItems: "center" }}>
        <ScheduleIcon sx={{ marginRight: 0.4 }} />
        {(meetingTime && (
          <FormattedDatetime date={new Date(meetingTime)} />
        )) || (
          <Typography>
            Du kan møte opp når som helst i{" "}
            <DynamicLink variant="body1" href="/info/branch/select">
              skolens åpningstider
            </DynamicLink>
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", marginTop: 0.4, alignItems: "center" }}>
        <PlaceIcon sx={{ marginRight: 0.4 }} />
        <Typography>{meetingLocation}</Typography>
      </Box>
    </Box>
  );
};

export default MeetingInfo;
