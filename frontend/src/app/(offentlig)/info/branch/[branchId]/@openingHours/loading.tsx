import { Skeleton, TableCell, TableRow } from "@mui/material";

export default function OpeningHoursLoading() {
  return [0, 1, 2, 3, 4, 5].map((i) => (
    <TableRow key={`skeletor-${i}`}>
      <TableCell>
        <Skeleton width={130} />
      </TableCell>
      <TableCell>
        <Skeleton width={38} />
      </TableCell>
      <TableCell>
        <Skeleton width={38} />
      </TableCell>
    </TableRow>
  ));
}
