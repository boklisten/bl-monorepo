import DynamicLink from "@frontend/components/DynamicLink";
import { FormattedDatetime } from "@frontend/components/matches/matchesList/helper";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Box, Typography } from "@mui/material";

const MeetingInfo = ({
  meetingTime,
  meetingLocation,
}: {
  meetingTime?: Date | undefined;
  meetingLocation: string;
}) => {
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
            Du kan møte opp når standen vår er åpen.{" "}
            <DynamicLink variant="body1" href="/info/branch">
              Se åpningstider her
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
