import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { ReactNode } from "react";

export function OpeningHoursLayout({ children }: { children: ReactNode }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="tabell over åpningstider">
        <TableHead>
          <TableRow>
            <TableCell>Dato</TableCell>
            <TableCell>Fra</TableCell>
            <TableCell>Til</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}
