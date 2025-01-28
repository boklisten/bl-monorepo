"use client";
import { Order } from "@boklisten/backend/shared/src/order/order";
import { Card } from "@mui/material";
import { useEffect, useState } from "react";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import OrderHistory from "@/components/OrderHistory";
import BL_CONFIG from "@/utils/bl-config";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>();

  useEffect(() => {
    const { details } = getAccessTokenBody();
    const ordersUrl = `${BL_CONFIG.collection.order}?customer=${details}&placed=true&sort=-creationTime`;
    const fetchDetails = async () => {
      const orders = await BlFetcher.get<Order[]>(ordersUrl);
      setOrders(orders);
    };
    fetchDetails();
  }, []);
  return (
    <>
      <title>Ordrehistorikk | Boklisten.no</title>
      <meta name="description" content="Se dine ordre" />
      <Card sx={{ paddingBottom: 4 }}>
        {orders && <OrderHistory orders={orders} />}
      </Card>
    </>
  );
};

export default OrdersPage;
