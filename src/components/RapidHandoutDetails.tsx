import { Order, OrderItem, UserDetail } from "@boklisten/bl-model";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Alert, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import { ItemStatus } from "@/components/matches/matches-helper";
import MatchItemTable from "@/components/matches/MatchItemTable";
import MatchScannerContent from "@/components/matches/MatchScannerContent";
import ScannerModal from "@/components/scanner/ScannerModal";
import BL_CONFIG from "@/utils/bl-config";

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
  const { data: orders, mutate: updateOrders } = useSWR(
    `${BL_CONFIG.collection.order}?placed=true&customer=${customer.id}`,
    BlFetcher.get<Order[]>,
    { refreshInterval: 5000 },
  );
  const [itemStatuses, setItemStatuses] = useState<ItemStatus[]>([]);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  useState(false);

  useEffect(() => {
    BlFetcher.get<Order[]>(
      `${BL_CONFIG.collection.order}?placed=true&customer=${customer.id}`,
    )
      .then((originalOrders) => {
        return setItemStatuses(mapOrdersToItemStatuses(originalOrders));
      })
      .catch((error) => {
        console.error("Failed to fetch original orders, error:", error);
      });
  }, [customer.id]);

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
        onScan={(blid) =>
          BlFetcher.post(BL_CONFIG.collection.order + "/rapid-handout", {
            blid,
            customerId: customer.id,
          })
        }
        open={scanModalOpen}
        handleSuccessfulScan={updateOrders}
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
