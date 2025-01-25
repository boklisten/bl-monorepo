import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ErrorIcon from "@mui/icons-material/Error";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";

import { ItemStatus } from "@/components/matches/matches-helper";

const MatchItemTable = ({
  itemFilter = null,
  itemStatuses,
  isSender,
}: {
  itemFilter?: string[] | null;
  itemStatuses: ItemStatus[];
  isSender: boolean;
}) => {
  return (
    <TableContainer component={Box}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tittel</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemStatuses
            .filter((is) => itemFilter === null || itemFilter.includes(is.id))
            .sort((a, b) => Number(a.fulfilled) - Number(b.fulfilled))
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <Tooltip
                  title={
                    (item.fulfilled
                      ? "Denne boken er registrert som "
                      : "Denne boken har ikke blitt registrert som ") +
                    (isSender ? "levert" : "mottatt")
                  }
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    {item.fulfilled ? (
                      <CheckBoxIcon sx={{ color: "green" }} />
                    ) : (
                      <ErrorIcon sx={{ color: "orange" }} />
                    )}
                  </TableCell>
                </Tooltip>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MatchItemTable;
