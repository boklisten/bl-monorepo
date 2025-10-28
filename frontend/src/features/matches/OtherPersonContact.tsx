import { AccessToken } from "@boklisten/backend/shared/access-token";
import { UserMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Group, Text } from "@mantine/core";
import { IconPhone } from "@tabler/icons-react";
import { decodeToken } from "react-jwt";

import NextAnchor from "@/shared/components/NextAnchor";
import BL_CONFIG from "@/shared/utils/bl-config";

const OtherPersonContact = ({
  userMatch,
}: {
  userMatch: UserMatchWithDetails;
}) => {
  const decodedAccessToken = decodeToken<AccessToken>(
    localStorage.getItem(BL_CONFIG.token.accessToken) ?? "",
  );
  const otherPerson =
    userMatch.customerA === decodedAccessToken?.details
      ? userMatch.customerBDetails
      : userMatch.customerADetails;

  return (
    <Group gap={5}>
      <IconPhone />
      <Text>
        {otherPerson.name},{" "}
        <NextAnchor href={`tel:${otherPerson.phone}`}>
          {formatPhoneNumber(otherPerson.phone)}
        </NextAnchor>
      </Text>
    </Group>
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
