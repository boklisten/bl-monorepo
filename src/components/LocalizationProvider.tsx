"use client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Moment } from "moment";
import { ReactNode } from "react";

class OverriddenAdapter extends AdapterMoment {
  // Get years in descending order
  override getYearRange = ([start, end]: [Moment, Moment]) => {
    const startDate = this.moment(start).startOf("year");
    const endDate = this.moment(end).endOf("year");
    const years: Moment[] = [];

    let current = startDate;
    while (current.isBefore(endDate)) {
      years.push(current);
      current = current.clone().add(1, "year");
    }

    return years.reverse();
  };
}

export default function CustomLocalizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LocalizationProvider dateAdapter={OverriddenAdapter} adapterLocale={"no"}>
      {children}
    </LocalizationProvider>
  );
}
