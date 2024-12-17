import { Branch, OpeningHour } from "@boklisten/bl-model";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box, Typography, Alert } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import "moment/locale/nb";

import BranchSelect from "@/components/BranchSelect";
import ContactInfo from "@/components/info/ContactInfo";

const compareOpeningHours = (a: OpeningHour, b: OpeningHour): number => {
  if (a.from < b.from) {
    return -1;
  }
  if (a.from > b.from) {
    return 1;
  }
  return 0;
};

const OpeningHourRow = ({ openingHour }: { openingHour: OpeningHour }) => {
  const fromDate = moment(openingHour.from).locale("nb");
  const toDate = moment(openingHour.to).locale("nb");
  const weekday = fromDate.format("dddd");
  const date = fromDate.format("DD.MM.YYYY");
  const fromTime = fromDate.format("HH:mm");
  const toTime = toDate.format("HH:mm");
  const capitalize = (s: string) =>
    s.length > 0 && s[0]?.toUpperCase() + s.slice(1);
  return (
    <TableRow
      key={openingHour.id}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      data-testid="openingHourRow"
    >
      <TableCell component="th" scope="row">
        {capitalize(weekday)} {date}
      </TableCell>
      <TableCell>{fromTime}</TableCell>
      <TableCell>{toTime}</TableCell>
    </TableRow>
  );
};

const BranchInfo = ({
  branch,
  openingHours,
}: {
  branch: Branch;
  openingHours: OpeningHour[];
}) => {
  const processedOpeningHours = openingHours
    .filter(({ id }) => branch.openingHours?.includes(id))
    .sort(compareOpeningHours);
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", marginTop: 4 }}>
        Åpningstider
      </Typography>
      <Box sx={{ my: 3.5 }}>
        <BranchSelect />
      </Box>

      {branch.location?.address?.length && (
        <Box
          sx={{ display: "flex", marginBottom: 2 }}
          data-testid="branch-address"
        >
          <LocationOnIcon />
          {branch.location?.address}
        </Box>
      )}
      {processedOpeningHours.length === 0 && (
        <>
          <Alert severity="info" data-testid="noHours" sx={{ my: 4 }}>
            Sesongen er over – eller åpningstidene er ikke klare enda. Du kan
            bestille bøker i Posten, eller kontakte oss for spørsmål.
          </Alert>
          <ContactInfo />
        </>
      )}
      {processedOpeningHours.length > 0 && (
        <TableContainer component={Paper}>
          <Table aria-label="tabell over åpningstider">
            <TableHead>
              <TableRow>
                <TableCell>Dato</TableCell>
                <TableCell>Fra</TableCell>
                <TableCell>Til</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedOpeningHours.map((openingHour) => (
                <OpeningHourRow
                  key={openingHour.id}
                  openingHour={openingHour}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BranchInfo;
