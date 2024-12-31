"use client";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment";
import { notFound } from "next/navigation";
import { use } from "react";

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
    notFound();
  }

  return processedOpeningHours.map((openingHour) => (
    <OpeningHourRow key={openingHour.id} openingHour={openingHour} />
  ));
}
