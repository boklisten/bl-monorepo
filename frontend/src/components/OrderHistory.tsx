import { Order } from "@boklisten/backend/shared/order/order";
import { Payment } from "@boklisten/backend/shared/payment/payment";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Container,
  Modal,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import moment from "moment";
import { useState } from "react";

import BlFetcher from "@/api/blFetcher";
import BL_CONFIG from "@/utils/bl-config";

// fetchPayments(orders);
// types are from a business POV
const orderTypes = {
  rent: "leie",
  buy: "solgt til oss",
  extend: "forlenget frist",
  sell: "kjøpt",
  buyout: "kjøpt ut",
  return: "returnert",
  cancel: "kansellert",
  "partly-payment": "delbetaling",
  loan: "lånt",
  buyback: "tilbakekjøp",
  "invoice-paid": "betalt faktura",
  "match-receive": "mottatt fra annen elev",
  "match-deliver": "gitt bort til annen elev",
};

const paymentTypes = {
  dibs: "Kort",
  card: "Kort",
  vipps: "Vipps",
  cash: "Kontant",
  branch: "På filial",
  later: "Betal senere",
  cashout: "Uttak",
};

const fetchPayment = async (paymentId: string) => {
  const [payment] = await BlFetcher.get<[Payment]>(
    `${BL_CONFIG.collection.payment}/${paymentId}`,
  );
  return payment;
};

const OrderHistory = ({ orders }: { orders: Order[] }) => {
  const [wait, setWait] = useState(false);
  const [openOrder, setOpenOrder] = useState("");
  const [openPayment, setOpenPayment] = useState<Payment | undefined>();

  const printReceipt = async (orderId: string) => {
    setWait(true);
    const data = await BlFetcher.get<[{ content: string }]>(
      `${BL_CONFIG.collection.order}/${orderId}/receipt`,
    );
    const byteCharacters = atob(data[0].content);
    const byteNumbers = Array.from({ length: byteCharacters.length });
    for (let index = 0; index < byteNumbers.length; index++) {
      byteNumbers[index] = byteCharacters.codePointAt(index);
    }

    // @ts-expect-error fixme: auto ignored
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: "application/pdf",
    });
    setWait(false);
    window.open(URL.createObjectURL(blob));
  };

  return (
    <Container
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", marginTop: 4, marginBottom: 2 }}
      >
        Ordrehistorikk
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dato</TableCell>
              <TableCell>Bøker</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              return (
                <>
                  <Modal
                    key={order.id + "modal"}
                    onClose={() => {
                      setOpenOrder("");
                    }}
                    open={openOrder === order.id}
                    sx={{
                      marginY: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Card
                      sx={{
                        width: "80%",
                        display: "flex",
                        flexDirection: "column",
                        overflowY: "auto",
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{ textAlign: "center", marginBottom: 2 }}
                      >
                        Ordredetaljer
                      </Typography>
                      <Button onClick={() => setOpenOrder("")}>Lukk</Button>
                      <LoadingButton
                        loading={wait}
                        onClick={() => printReceipt(order.id)}
                      >
                        Skriv ut kvittering
                      </LoadingButton>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell align="center">
                              <b>ID</b>
                            </TableCell>
                            <TableCell align="center">{order.id}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align={"center"}>
                              <b>Tidspunkt</b>
                            </TableCell>
                            <TableCell align={"center"}>
                              {moment(order.creationTime).format("hh:mm:ss")}{" "}
                              {moment(order.creationTime).format("DD/MM/YYYY")}
                            </TableCell>
                          </TableRow>
                          {order.payments !== undefined &&
                            order.payments.length > 0 &&
                            !openPayment && (
                              <>
                                {[0, 1, 2].map((rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    <TableCell>
                                      <Skeleton />
                                    </TableCell>
                                    <TableCell>
                                      <Skeleton />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </>
                            )}
                          {openPayment && openPayment?.order === order.id && (
                            <>
                              <TableRow>
                                <TableCell align="center">
                                  <b>Betalingsstatus</b>
                                </TableCell>
                                <TableCell align="center">
                                  {openPayment.confirmed
                                    ? "Bekreftet"
                                    : "Ikke bekreftet"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell align="center">
                                  <b>Betalingsmiddel</b>
                                </TableCell>
                                <TableCell align="center">
                                  {paymentTypes[openPayment.method]}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell align="center">
                                  <b>Totalt betalt</b>
                                </TableCell>
                                <TableCell align="center">
                                  {openPayment.amount} kr
                                </TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                      <Typography
                        variant="h5"
                        sx={{ textAlign: "center", marginY: 2 }}
                      >
                        Bøker
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        {order.orderItems.map((orderItem) => {
                          return (
                            <Card
                              key={orderItem.blid}
                              sx={{
                                marginBottom: 2,
                                width: "400px",
                                marginX: 1,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  textAlign: "center",
                                  marginBottom: 0.2,
                                }}
                              >
                                {orderItem.title}
                              </Typography>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell align={"center"}>
                                      <b>BL-ID</b>
                                    </TableCell>
                                    <TableCell align={"center"}>
                                      {orderItem.blid ?? "ingen ID tilknyttet"}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell align={"center"}>
                                      <b>Type</b>
                                    </TableCell>
                                    <TableCell align={"center"}>
                                      {orderTypes?.[orderItem.type] ?? "Ukjent"}
                                    </TableCell>
                                  </TableRow>
                                  {orderItem.amount !== undefined &&
                                    orderItem.type !== "return" && (
                                      <TableRow>
                                        <TableCell align="center">
                                          <b>Betalt</b>
                                        </TableCell>
                                        <TableCell align="center">
                                          {orderItem.amount} kr
                                        </TableCell>
                                      </TableRow>
                                    )}

                                  {/**@ts-expect-error orderItemInfo type is outdated*/}
                                  {orderItem.info?.amountLeftToPay && (
                                    <TableRow>
                                      <TableCell align="center">
                                        <b>Betal senere</b>
                                      </TableCell>
                                      <TableCell align="center">
                                        {/**@ts-expect-error orderItemInfo type is outdated*/}
                                        {orderItem.info.amountLeftToPay} kr
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  {orderItem.info?.to && (
                                    <TableRow>
                                      <TableCell align="center">
                                        <b>Frist</b>
                                      </TableCell>
                                      <TableCell align="center">
                                        {moment(orderItem.info.to).format(
                                          "DD/MM/YYYY",
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Card>
                          );
                        })}
                      </Box>
                    </Card>
                  </Modal>
                  <TableRow key={order.id + "rowOverview"}>
                    <TableCell>
                      {moment(order.creationTime).format("DD/MM/YYYY")}
                      <Button
                        onClick={async () => {
                          setOpenOrder(order.id);
                          if (order.payments && order.payments.length > 0) {
                            const payment = await fetchPayment(
                              order.payments[0] ?? "",
                            );
                            setOpenPayment(payment);
                          }
                        }}
                      >
                        Detaljer
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {order.orderItems.map((orderItem) => (
                          <Typography key={orderItem.blid} variant="body2">
                            {orderItem.title}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {order.orderItems.map((orderItem) => (
                          <Typography
                            key={"0" + orderItem.blid}
                            variant="body2"
                          >
                            {orderTypes?.[orderItem.type] ?? "Ukjent"}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderHistory;
