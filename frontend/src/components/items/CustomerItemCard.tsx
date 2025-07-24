import {
  ActionableCustomerItem,
  CustomerItemStatus,
} from "@boklisten/backend/shared/customer-item/actionable_customer_item";
import {
  Event,
  HourglassTop,
  LocalLibrary,
  LocationPin,
  MoreTime,
  QrCodeScanner,
  ShoppingCart,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import moment from "moment";
import { ReactNode } from "react";

import useAuthLinker from "@/utils/useAuthLinker";

function InfoEntry({
  startIcon,
  label,
  text,
}: {
  startIcon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <Stack gap={0.5} direction={"row"} alignItems={"center"}>
      {startIcon}
      <Tooltip title={label}>
        <Typography sx={{ color: "text.secondary" }}>{text}</Typography>
      </Tooltip>
    </Stack>
  );
}

function StatusChip({ status }: { status: CustomerItemStatus }) {
  return (
    <Chip
      sx={{ ml: 1 }}
      label={status.text}
      color={
        ["returned", "buyout"].includes(status.type)
          ? "default"
          : status.type === "overdue"
            ? "error"
            : "success"
      }
      size="small"
    />
  );
}

export default function CustomerItemCard({
  actionableCustomerItem,
}: {
  actionableCustomerItem: ActionableCustomerItem;
}) {
  const { redirectTo } = useAuthLinker();
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" mb={2}>
          {actionableCustomerItem.item.title}
          <StatusChip status={actionableCustomerItem.status} />
        </Typography>
        <Stack gap={1}>
          <InfoEntry
            startIcon={<QrCodeScanner />}
            label={"Unik ID"}
            text={actionableCustomerItem.blid ?? ""}
          />
          <InfoEntry
            label={"ISBN"}
            startIcon={<LocalLibrary />}
            text={actionableCustomerItem.item.isbn}
          />
          <InfoEntry
            label={"Ansvarlig filial"}
            startIcon={<LocationPin />}
            text={actionableCustomerItem.branchName}
          />
          <InfoEntry
            label={"Utdelingstidspunkt"}
            startIcon={<HourglassTop />}
            text={moment(actionableCustomerItem.handoutAt).format("DD/MM/YYYY")}
          />
          <InfoEntry
            label={"Frist for innlevering"}
            startIcon={<Event />}
            text={moment(actionableCustomerItem.deadline).format("DD/MM/YYYY")}
          />
        </Stack>
      </CardContent>
      {["active", "overdue"].includes(actionableCustomerItem.status.type) && (
        <CardActions>
          {actionableCustomerItem.actions.map((action) => (
            <Tooltip key={action.type} title={action.tooltip}>
              <span>
                <Button
                  startIcon={
                    action.type === "extend" ? <MoreTime /> : <ShoppingCart />
                  }
                  disabled={!action.available}
                  size="small"
                  onClick={() => {
                    redirectTo(
                      "bl-web",
                      `cart/receive?cart_actions=${JSON.stringify([{ customerItemId: actionableCustomerItem.id, action: action.type }])}`,
                    );
                  }}
                >
                  {action.buttonText}
                </Button>
              </span>
            </Tooltip>
          ))}
        </CardActions>
      )}
    </Card>
  );
}
