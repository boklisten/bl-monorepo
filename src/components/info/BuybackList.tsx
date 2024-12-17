"use client";
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
} from "@mui/material";
import { Box } from "@mui/system";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import BL_CONFIG from "@/utils/bl-config";
import { Item } from "@/utils/types";

const BuybackList = ({
  defaultBuybackItems,
}: {
  defaultBuybackItems: Item[];
}) => {
  const { data, error } = useSWR(
    `${BL_CONFIG.collection.item}?buyback=true&sort=title`,
    BlFetcher.get<Item[]>,
  );
  const items = data ?? defaultBuybackItems;
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", marginTop: 4, marginBottom: 2 }}
      >
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
                  data-testid="table-row"
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
          <Alert severity="info" data-testid="missing-error">
            Ingen bøker i listen. Kom tilbake senere for å se en oppdatert
            liste.
          </Alert>
        )}
        {error && (
          <Alert severity="error" data-testid="api-error">
            Noe gikk galt! Vennligst prøv igjen senere.
          </Alert>
        )}
      </TableContainer>
    </Box>
  );
};

export default BuybackList;
