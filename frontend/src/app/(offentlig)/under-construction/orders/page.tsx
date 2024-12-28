"use client";
import BlFetcher from "@frontend/api/blFetcher";
import { getAccessTokenBody } from "@frontend/api/token";
import OrderHistory from "@frontend/components/OrderHistory";
import BL_CONFIG from "@frontend/utils/bl-config";
import { Card } from "@mui/material";
import { Order } from "@shared/order/order";
import { useEffect, useState } from "react";

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
