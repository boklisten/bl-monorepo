import { Order } from "@boklisten/backend/shared/order/order";
import { OrderItem } from "@boklisten/backend/shared/order/order-item/order-item";
import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Alert, Button, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ItemStatus } from "@/components/matches/matches-helper";
import MatchItemTable from "@/components/matches/MatchItemTable";
import MatchScannerContent from "@/components/matches/MatchScannerContent";
import ScannerModal from "@/components/scanner/ScannerModal";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

function calculateUnfulfilledOrderItems(orders: Order[]): OrderItem[] {
  return orders
    .filter((order) => order.byCustomer && !order.handoutByDelivery)
    .flatMap((order) => order.orderItems)
    .filter(
      (orderItem) =>
        !orderItem.movedToOrder &&
        !orderItem.handout &&
        (orderItem.type === "rent" || orderItem.type === "partly-payment"),
    );
}

function mapOrdersToItemStatuses(orders: Order[]): ItemStatus[] {
  return calculateUnfulfilledOrderItems(orders).map((oi) => ({
    id: oi.item,
    title: oi.title,
    fulfilled: false,
  }));
}

export default function RapidHandoutDetails({
  customer,
}: {
  customer: UserDetail;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const ordersUrl = client.$url("collection.orders.getAll", {
    query: { placed: true, customer: customer.id },
  });
  const { data: orders } = useQuery({
    queryKey: [
      client.$url("collection.orders.getAll", {
        query: { placed: true, customer: customer.id },
      }),
    ],
    queryFn: () =>
      client
        .$route("collection.orders.getAll")
        .$get({
          query: {
            placed: true,
            customer: customer.id,
          },
        })
        .then((res) => unpack<Order[]>(res) ?? []),
    staleTime: 5000,
  });
  const [itemStatuses, setItemStatuses] = useState<ItemStatus[]>([]);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  useState(false);

  useEffect(() => {
    client
      .$route("collection.orders.getAll")
      .$get({
        query: {
          placed: true,
          customer: customer.id,
        },
      })
      .then((res) => unpack<Order[]>(res) ?? [])
      .then((originalOrders) => {
        return setItemStatuses(mapOrdersToItemStatuses(originalOrders));
      })
      .catch((error) => {
        console.error("Failed to fetch original orders, error:", error);
      });
  }, [client, customer.id]);

  useEffect(() => {
    if (!orders) {
      return;
    }
    const unfulfilledOrderItems = calculateUnfulfilledOrderItems(orders);
    setItemStatuses((previousState) =>
      previousState.map((itemStatus) => ({
        ...itemStatus,
        fulfilled: !unfulfilledOrderItems.some(
          (orderItem) => orderItem.item === itemStatus.id,
        ),
      })),
    );
  }, [orders]);

  return itemStatuses.length === 0 ? (
    <Alert severity={"info"} sx={{ mt: 2 }}>
      Denne kunden har for øyeblikket ingen bestilte bøker
    </Alert>
  ) : (
    <>
      <Typography
        variant={"h2"}
        sx={{
          textAlign: "center",
          mt: 6,
          mb: 2,
        }}
      >
        Plukkliste
      </Typography>
      <Button
        color="success"
        startIcon={<QrCodeScannerIcon />}
        variant={"contained"}
        onClick={() => setScanModalOpen(true)}
      >
        Scan bøker
      </Button>
      <MatchItemTable itemStatuses={itemStatuses} isSender={true} />
      <ScannerModal
        onScan={async (blid) => {
          const response = await client
            .$route("collection.orders.operation.rapid-handout.post")
            .$post({
              blid,
              customerId: customer.id,
            });

          return unpack<[{ feedback: string }]>(response);
        }}
        open={scanModalOpen}
        handleSuccessfulScan={async () => {
          await queryClient.invalidateQueries({ queryKey: [ordersUrl] });
        }}
        handleClose={() => {
          setScanModalOpen(false);
        }}
      >
        <MatchScannerContent
          scannerOpen={scanModalOpen}
          handleClose={() => {
            setScanModalOpen(false);
          }}
          itemStatuses={itemStatuses}
          expectedItems={itemStatuses.map((itemStatus) => itemStatus.id)}
          fulfilledItems={itemStatuses
            .filter((itemStatus) => itemStatus.fulfilled)
            .map((itemStatus) => itemStatus.id)}
        />
      </ScannerModal>
    </>
  );
}
