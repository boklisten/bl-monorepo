import { StandMatchWithDetails } from "@boklisten/backend/shared/match/match-dtos";
import { KeyboardDoubleArrowRight, SwapHoriz } from "@mui/icons-material";
import { SxProps, Typography, Box } from "@mui/material";

import { UserMatchStatus } from "@/components/matches/matches-helper";
import theme from "@/utils/theme";

export function formatActionsString(handoffItems: number, pickupItems: number) {
  const hasHandoffItems = handoffItems > 0;
  const hasPickupItems = pickupItems > 0;
  const stringBuilder: string[] = [];
  stringBuilder.push("Du skal ");

  if (hasHandoffItems) {
    stringBuilder.push("levere ");
    if (handoffItems === 1) {
      stringBuilder.push("én");
      if (!hasPickupItems) {
        stringBuilder.push(" bok");
      }
    } else {
      stringBuilder.push(`${handoffItems}`);
      if (!hasPickupItems) {
        stringBuilder.push(" bøker");
      }
    }
    if (hasPickupItems) {
      stringBuilder.push(" og ");
    }
  }
  if (hasPickupItems) {
    stringBuilder.push("motta ");
    if (pickupItems === 1) {
      stringBuilder.push("én bok");
    } else {
      stringBuilder.push(`${pickupItems} bøker`);
    }
  }
  return stringBuilder.join("");
}

export const FormattedDatetime = ({ date }: { date: Date }) => {
  const dateString = date.toLocaleDateString("no", {
    timeZone: "Europe/Oslo",
    dateStyle: "long",
  });
  const timeString = date.toLocaleTimeString("no", {
    timeZone: "Europe/Oslo",
    timeStyle: "short",
  });
  return (
    <>
      <Typography>{timeString}</Typography>
      <Typography color={theme.palette.grey["600"]}>, {dateString}</Typography>
    </>
  );
};

const me = <span style={{ color: "#757575", fontWeight: 400 }}>Meg</span>;

export const UserMatchTitle = ({
  userMatchStatus,
}: {
  userMatchStatus: UserMatchStatus;
}) => {
  const { currentUser, otherUser } = userMatchStatus;
  const arrowSize = "1.18em";
  if (currentUser.items.length > 0 && otherUser.items.length === 0) {
    return (
      <>
        {me}{" "}
        <KeyboardDoubleArrowRight
          sx={{ verticalAlign: "text-bottom", fontSize: arrowSize }}
        />{" "}
        <Box component="span" fontWeight="bold">
          {otherUser.name}
        </Box>
      </>
    );
  }
  if (
    currentUser.wantedItems.length > 0 &&
    otherUser.wantedItems.length === 0
  ) {
    return (
      <>
        <Box component="span" fontWeight="bold">
          {otherUser.name}
        </Box>{" "}
        <KeyboardDoubleArrowRight
          sx={{ verticalAlign: "text-bottom", fontSize: arrowSize }}
        />{" "}
        {me}
      </>
    );
  }
  return (
    <>
      {me}{" "}
      <SwapHoriz sx={{ verticalAlign: "text-bottom", fontSize: arrowSize }} />{" "}
      <Box component="span" fontWeight="bold">
        {otherUser.name}
      </Box>
    </>
  );
};

interface StandMatchTitleProps {
  standMatch: StandMatchWithDetails;
}

export const StandMatchTitle = ({ standMatch }: StandMatchTitleProps) => {
  const hasHandoffItems = standMatch.expectedHandoffItems.length > 0;
  const hasPickupItems = standMatch.expectedPickupItems.length > 0;

  const stand = (
    <Box component="span" fontWeight="bold">
      Stand
    </Box>
  );

  const isMeFirst = hasPickupItems ? hasHandoffItems : true;

  const iconStyle: SxProps = {
    verticalAlign: "text-bottom",
    fontSize: "1.18em",
  };

  const left = isMeFirst ? me : stand;
  const right = isMeFirst ? stand : me;
  const arrow = hasHandoffItems ? (
    hasPickupItems ? (
      <SwapHoriz sx={iconStyle} />
    ) : (
      <KeyboardDoubleArrowRight sx={iconStyle} />
    )
  ) : (
    <KeyboardDoubleArrowRight sx={iconStyle} />
  );
  return (
    <>
      {left} {arrow} {right}
    </>
  );
};
