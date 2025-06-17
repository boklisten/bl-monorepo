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
  isRapidHandout = false,
  standItemIds = [],
  isSender,
}: {
  itemFilter?: string[] | null;
  itemStatuses: ItemStatus[];
  standItemIds?: string[];
  isRapidHandout?: boolean;
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
            .sort((a, b) => {
              const aIsStand = standItemIds.includes(a.id);
              const bIsStand = standItemIds.includes(b.id);
              if (isRapidHandout && aIsStand !== bIsStand) {
                return bIsStand ? 1 : -1;
              }
              return Number(a.fulfilled) - Number(b.fulfilled);
            })
            .map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  opacity:
                    isRapidHandout && !standItemIds?.includes(item.id)
                      ? 0.4
                      : 1,
                }}
              >
                <TableCell>
                  {item.title}{" "}
                  {isRapidHandout &&
                    (standItemIds?.includes(item.id)
                      ? "(hentes på stand)"
                      : "(mottas fra elev)")}
                </TableCell>
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
