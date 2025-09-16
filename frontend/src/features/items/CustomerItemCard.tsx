import {
  ActionableCustomerItem,
  CustomerItemStatus,
} from "@boklisten/backend/shared/customer-item/actionable_customer_item";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBook2,
  IconCalendarEvent,
  IconClockPlus,
  IconHourglassHigh,
  IconQrcode,
  IconSchool,
  IconShoppingCart,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { ReactNode } from "react";

import useAuthLinker from "@/shared/hooks/useAuthLinker";

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
    <Group gap={"xs"}>
      {startIcon}
      <Tooltip label={label}>
        <Text>{text}</Text>
      </Tooltip>
    </Group>
  );
}

function StatusChip({ status }: { status: CustomerItemStatus }) {
  return (
    <Badge
      color={
        ["returned", "buyout"].includes(status.type)
          ? "gray"
          : status.type === "overdue"
            ? "red"
            : "green"
      }
    >
      {status.text}
    </Badge>
  );
}

export default function CustomerItemCard({
  actionableCustomerItem,
}: {
  actionableCustomerItem: ActionableCustomerItem;
}) {
  const { redirectTo } = useAuthLinker();
  return (
    <Card shadow={"md"} withBorder>
      <Group gap={"xs"} mb={"md"}>
        <Title order={3}>{actionableCustomerItem.item.title}</Title>
        <StatusChip status={actionableCustomerItem.status} />
      </Group>
      <Stack>
        <InfoEntry
          startIcon={<IconQrcode />}
          label={"Unik ID"}
          text={actionableCustomerItem.blid ?? ""}
        />
        <InfoEntry
          label={"ISBN"}
          startIcon={<IconBook2 />}
          text={actionableCustomerItem.item.isbn}
        />
        <InfoEntry
          label={"Ansvarlig filial"}
          startIcon={<IconSchool />}
          text={actionableCustomerItem.branchName}
        />
        <InfoEntry
          label={"Utdelingstidspunkt"}
          startIcon={<IconHourglassHigh />}
          text={dayjs(actionableCustomerItem.handoutAt).format("DD/MM/YYYY")}
        />
        <Divider />
        <Group>
          <IconCalendarEvent />
          <Text>Frist: </Text>
          <Text fw={"bold"}>
            {dayjs(actionableCustomerItem.deadline).format("DD/MM/YYYY")}
          </Text>
        </Group>
        {["active", "overdue"].includes(actionableCustomerItem.status.type) && (
          <Group>
            {actionableCustomerItem.actions.map((action) => (
              <Tooltip
                key={action.type}
                label={action.tooltip}
                disabled={!action.tooltip}
              >
                <Button
                  leftSection={
                    action.type === "extend" ? (
                      <IconClockPlus />
                    ) : (
                      <IconShoppingCart />
                    )
                  }
                  disabled={!action.available}
                  onClick={() => {
                    redirectTo(
                      "bl-web",
                      `cart/receive?caller=items&cart_actions=${JSON.stringify([{ customerItemId: actionableCustomerItem.id, action: action.type }])}`,
                      true,
                    );
                  }}
                >
                  {action.buttonText}
                </Button>
              </Tooltip>
            ))}
          </Group>
        )}
      </Stack>
    </Card>
  );
}
