import { UserMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { Anchor, Group, Text } from "@mantine/core";
import { IconPhone } from "@tabler/icons-react";
import Link from "next/link";

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
    <Group gap={5}>
      <IconPhone />
      <Text>
        {otherPerson.name},{" "}
        <Anchor component={Link} href={`tel:${otherPerson.phone}`}>
          {formatPhoneNumber(otherPerson.phone)}
        </Anchor>
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
