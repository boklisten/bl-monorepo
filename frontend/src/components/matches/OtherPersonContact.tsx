import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { Box, Typography } from "@mui/material";
import { UserMatchWithDetails } from "@shared/match/match-dtos";

import DynamicLink from "@/components/DynamicLink";

const OtherPersonContact = ({
  userMatch,
  currentUserId,
}: {
  userMatch: UserMatchWithDetails;
  currentUserId: string;
}) => {
  const otherPerson =
    userMatch.customerA === currentUserId
      ? userMatch.customerBDetails
      : userMatch.customerADetails;

  return (
    <Box
      key={otherPerson.phone}
      sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}
    >
      <PhoneIphoneIcon sx={{ marginRight: 0.4 }} />
      <Typography>
        {otherPerson.name},{" "}
        <DynamicLink
          sx={{ fontSize: "inherit" }}
          href={`tel:${otherPerson.phone}`}
        >
          {formatPhoneNumber(otherPerson.phone)}
        </DynamicLink>
      </Typography>
    </Box>
  );
};

function formatPhoneNumber(number: string): string {
  if (/\d{8}/.exec(number) !== null) {
    return (
      number.slice(0, 3) + " " + number.slice(3, 5) + " " + number.slice(5, 8)
    );
  }
  if (/\d{10}/.exec(number) !== null) {
    return (
      number.slice(2) +
      " " +
      number.slice(2, 5) +
      " " +
      number.slice(5, 7) +
      " " +
      number.slice(7, 10)
    );
  }
  return number;
}

export default OtherPersonContact;
