"use client";
import { Order } from "@boklisten/backend/shared/order/order";
import { Card } from "@mui/material";
import { useEffect, useState } from "react";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import OrderHistory from "@/components/OrderHistory";
import useApiClient from "@/utils/api/useApiClient";

const OrdersPage = () => {
  const { client } = useApiClient();
  const [orders, setOrders] = useState<Order[]>();

  useEffect(() => {
    const { details } = getAccessTokenBody();
    const ordersUrl = `${client.$url("collection.orders.getAll")}?customer=${details}&placed=true&sort=-creationTime`;
    const fetchDetails = async () => {
      const orders = await BlFetcher.get<Order[]>(ordersUrl);
      setOrders(orders);
    };
    fetchDetails();
  }, [client]);
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
