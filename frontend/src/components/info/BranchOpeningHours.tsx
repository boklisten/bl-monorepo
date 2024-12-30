import ContactInfo from "@frontend/components/info/ContactInfo";
import { Alert, Skeleton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment";
import { ReactNode, use } from "react";
import "moment/locale/nb";

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
    <TableRow key={openingHour.id} data-testid="openingHourRow">
      <TableCell component="th" scope="row">
        {capitalize(weekday)} {date}
      </TableCell>
      <TableCell>{fromTime}</TableCell>
      <TableCell>{toTime}</TableCell>
    </TableRow>
  );
};

function BranchOpeningHoursBase({ children }: { children: ReactNode }) {
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

export function BranchOpeningHoursSkeleton() {
  return (
    <BranchOpeningHoursBase>
      {[0, 1, 2, 3, 4, 5].map((i) => (
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
      ))}
    </BranchOpeningHoursBase>
  );
}

export default function BranchOpeningHours({
  branchPromise,
  openingHoursPromise,
}: {
  branchPromise: Promise<[Branch]>;
  openingHoursPromise: Promise<OpeningHour[]>;
}) {
  const [branch] = use(branchPromise);
  const openingHours = use(openingHoursPromise);

  const processedOpeningHours = openingHours
    .filter(({ id }) => branch.openingHours?.includes(id))
    .sort(compareOpeningHours);
  if (processedOpeningHours.length === 0) {
    return (
      <>
        <Alert severity="info" data-testid="noHours" sx={{ my: 4 }}>
          Sesongen er over – eller åpningstidene er ikke klare enda. Du kan
          bestille bøker i Posten, eller kontakte oss for spørsmål.
        </Alert>
        <ContactInfo />
      </>
    );
  }

  return (
    <BranchOpeningHoursBase>
      {processedOpeningHours.map((openingHour) => (
        <OpeningHourRow key={openingHour.id} openingHour={openingHour} />
      ))}
    </BranchOpeningHoursBase>
  );
}
