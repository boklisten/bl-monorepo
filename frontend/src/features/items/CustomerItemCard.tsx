import { CustomerItemStatus } from "@boklisten/backend/shared/customer-item/actionable_customer_item";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconBasketCheck,
  IconBook2,
  IconCalendarEvent,
  IconClockPlus,
  IconHourglassHigh,
  IconQrcode,
  IconSchool,
  IconShoppingCart,
} from "@tabler/icons-react";
import { InferResponseType } from "@tuyau/client";
import dayjs from "dayjs";
import { ReactNode } from "react";

import useCart from "@/shared/hooks/useCart";
import { publicApiClient } from "@/shared/utils/publicApiClient";

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
  actionableCustomerItem: InferResponseType<
    typeof publicApiClient.v2.customer_items.$get
  >[number];
}) {
  const { findItemInCart, addToCart, removeFromCart } = useCart();
  const extendCartItem = findItemInCart({
    item: {
      id: actionableCustomerItem.item.id,
    },
    type: "extend",
  });
  const buyoutCartItem = findItemInCart({
    item: {
      id: actionableCustomerItem.item.id,
    },
    type: "buyout",
  });
  const extendOptions =
    actionableCustomerItem.actions.find((action) => action.type === "extend")
      ?.extendOptions ?? [];

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
                      extendCartItem ? (
                        <IconBasketCheck />
                      ) : (
                        <IconClockPlus />
                      )
                    ) : buyoutCartItem ? (
                      <IconBasketCheck />
                    ) : (
                      <IconShoppingCart />
                    )
                  }
                  bg={
                    (action.type === "extend" && extendCartItem) ||
                    (action.type === "buyout" && buyoutCartItem)
                      ? "green"
                      : ""
                  }
                  disabled={!action.available}
                  onClick={() => {
                    if (
                      (action.type === "extend" && extendCartItem) ||
                      (action.type === "buyout" && buyoutCartItem)
                    ) {
                      removeFromCart(actionableCustomerItem.item.id);
                      return;
                    }
                    if (action.type === "extend") {
                      addToCart({
                        item: {
                          id: actionableCustomerItem.item.id,
                          title: actionableCustomerItem.item.title,
                        },
                        type: action.type,
                        deadline: action.extendOptions?.[0]?.date,
                        price: action.extendOptions?.[0]?.price,
                      });
                    }
                    if (action.type === "buyout") {
                      addToCart({
                        item: {
                          id: actionableCustomerItem.item.id,
                          title: actionableCustomerItem.item.title,
                        },
                        type: action.type,
                        price: action.buyoutPrice,
                      });
                    }
                  }}
                >
                  {action.buttonText}
                </Button>
              </Tooltip>
            ))}
          </Group>
        )}
        <Stack gap={5}>
          {extendCartItem ? (
            <Group gap={5}>
              <Text>Forleng til</Text>
              {extendOptions.length > 1 ? (
                <SegmentedControl
                  value={dayjs(extendCartItem.deadline).format("DD/MM/YYYY")}
                  data={extendOptions.map((extendOption) =>
                    dayjs(extendOption.date).format("DD/MM/YYYY"),
                  )}
                  onChange={(value) => {
                    const extendOption = extendOptions.find((option) =>
                      dayjs(option.date).isSame(dayjs(value, "DD/MM/YYYY")),
                    );
                    if (!extendOption) return;
                    addToCart({
                      ...extendCartItem,
                      deadline: extendOption.date,
                      price: extendOption.price,
                    });
                  }}
                />
              ) : (
                <Text fw={"bold"}>
                  {dayjs(extendCartItem.deadline).format("DD/MM/YYYY")}
                </Text>
              )}
            </Group>
          ) : (
            <></>
          )}
          {extendCartItem || buyoutCartItem ? (
            <Group gap={5}>
              <Text>Pris:</Text>
              <Text fw={"bold"}>
                {(extendCartItem || buyoutCartItem)?.price} kr
              </Text>
            </Group>
          ) : (
            <></>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
