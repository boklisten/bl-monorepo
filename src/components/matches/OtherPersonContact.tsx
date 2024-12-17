import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { Box, Typography } from "@mui/material";

import DynamicLink from "@/components/DynamicLink";
import { UserMatchWithDetails } from "@/utils/types";

const OtherPersonContact = ({
  match,
  currentUserId,
}: {
  match: UserMatchWithDetails;
  currentUserId: string;
}) => {
  const otherPerson =
    match.receiver === currentUserId
      ? match.senderDetails
      : match.receiverDetails;

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
          href={`tel:+47${otherPerson.phone}`}
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
