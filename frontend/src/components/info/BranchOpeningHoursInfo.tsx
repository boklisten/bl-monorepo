"use client";
import { Branch } from "@boklisten/backend/shared/branch/branch";
import { OpeningHour } from "@boklisten/backend/shared/opening-hour/opening-hour";
import { Alert } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import { use } from "react";

import ContactInfo from "@/components/info/ContactInfo";

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

  return processedOpeningHours.map((openingHour) => (
    <OpeningHourRow key={openingHour.id} openingHour={openingHour} />
  ));
}
