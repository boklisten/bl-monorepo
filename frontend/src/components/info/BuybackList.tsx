"use client";
import { Item } from "@boklisten/backend/shared/item/item";
import {
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import BlFetcher from "@/api/blFetcher";
import useApiClient from "@/utils/api/useApiClient";

const BuybackList = ({
  defaultBuybackItems,
}: {
  defaultBuybackItems: Item[];
}) => {
  const client = useApiClient();

  const { data, error } = useQuery({
    queryKey: [
      client.$url("collection.items.getAll", {
        query: { buyback: true, sort: "title" },
      }),
    ],
    queryFn: ({ queryKey }) => BlFetcher.get<Item[]>(queryKey[0] ?? ""),
  });
  const items = data ?? defaultBuybackItems;
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
        Innkjøpsliste
      </Typography>
      <Typography sx={{ marginX: 2 }}>
        Dette er listen over bøkene vi kjøper inn. Vær oppmerksom på at denne
        listen kan endre seg fortløpende. Vi tar forbehold for eventuelle feil i
        innkjøpslisten!
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="tabell over innkjøpsliste">
          <TableHead>
            <TableRow>
              <TableCell>Tittel</TableCell>
              <TableCell>ISBN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!error &&
              items.map((item) => (
                <TableRow
                  key={item.info.isbn}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.title}
                  </TableCell>
                  <TableCell>{item.info.isbn}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!error && items.length === 0 && (
          <Alert severity="info">
            Ingen bøker i listen. Kom tilbake senere for å se en oppdatert
            liste.
          </Alert>
        )}
        {error && (
          <Alert severity="error">
            Noe gikk galt! Vennligst prøv igjen senere.
          </Alert>
        )}
      </TableContainer>
    </Box>
  );
};

export default BuybackList;
