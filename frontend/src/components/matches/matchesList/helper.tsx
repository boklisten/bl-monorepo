import theme from "@frontend/utils/theme";
import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@frontend/utils/types";
import { KeyboardDoubleArrowRight, SwapHoriz } from "@mui/icons-material";
import { SxProps, Typography } from "@mui/material";
import { Box } from "@mui/system";

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

interface UserMatchTitleProps {
  match: UserMatchWithDetails;
  isSender: boolean;
}

export const UserMatchTitle = ({ match, isSender }: UserMatchTitleProps) => {
  const arrowSize = "1.18em";
  return (
    <>
      {isSender ? (
        <>
          {me}{" "}
          <KeyboardDoubleArrowRight
            sx={{ verticalAlign: "text-bottom", fontSize: arrowSize }}
          />{" "}
          <Box component="span" fontWeight="bold">
            {match.receiverDetails.name}
          </Box>
        </>
      ) : (
        <>
          <Box component="span" fontWeight="bold">
            {match.senderDetails.name}
          </Box>{" "}
          <KeyboardDoubleArrowRight
            sx={{ verticalAlign: "text-bottom", fontSize: arrowSize }}
          />{" "}
          {me}
        </>
      )}
    </>
  );
};

interface StandMatchTitleProps {
  match: StandMatchWithDetails;
}

export const StandMatchTitle = ({ match }: StandMatchTitleProps) => {
  const hasHandoffItems = match.expectedHandoffItems.length > 0;
  const hasPickupItems = match.expectedPickupItems.length > 0;

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
