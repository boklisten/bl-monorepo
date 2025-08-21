import { Table, TableBody, TableContainer, TableHead } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export default function OpeningHoursLayout({
  children,
}: LayoutProps<"/info/branch/[branchId]">) {
  return (
    <TableContainer>
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
