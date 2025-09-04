import { SegmentedControlItem } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import moment from "moment";
import { useState } from "react";

import SegmentedControlWithLabel from "@/components/ui/SegmentedControlWithLabel";
import { useFieldContext } from "@/hooks/form";

export function calculateDeadlineOptions() {
  const today = new Date();
  const summerDeadline = new Date(today.getFullYear(), 6, 1);
  const winterDeadline = new Date(today.getFullYear(), 11, 20);
  // Continue to show the deadline for a month afterward, with warning
  const summerDeadlinePlusGracePeriod = new Date(
    summerDeadline.getFullYear(),
    7,
    1,
  );
  const winterDeadlinePlusGracePeriod = new Date(
    winterDeadline.getFullYear() + 1,
    0,
    20,
  );

  if (today > summerDeadlinePlusGracePeriod) {
    summerDeadline.setFullYear(today.getFullYear() + 1);
  }
  if (today > winterDeadlinePlusGracePeriod) {
    winterDeadline.setFullYear(today.getFullYear() + 1);
  }

  let usualDates = [summerDeadline, winterDeadline];
  if (summerDeadline > winterDeadline) {
    usualDates = [winterDeadline, summerDeadline];
  }

  return [
    ...usualDates.map((option) => ({
      value: option.toString(),
      label: moment(option).format("DD/MM/yyyy"),
    })),
    { value: "custom", label: "Egendefinert" },
  ] as const satisfies SegmentedControlItem[];
}

export default function SegmentedDeadlineField() {
  const deadlineOptions = calculateDeadlineOptions();

  const field = useFieldContext<Date | null>();
  const [datePickerValue, setDatePickerValue] = useState<Date | null>(null);
  const [deadlineToggleValue, setDeadlineToggleValue] = useState<string | null>(
    deadlineOptions[0].value,
  );
  return (
    <>
      <SegmentedControlWithLabel
        label={"Frist"}
        data={deadlineOptions}
        onChange={(newDeadline) => {
          setDeadlineToggleValue(newDeadline);
          field.handleChange(
            newDeadline === "custom" ? datePickerValue : new Date(newDeadline),
          );
        }}
      />
      <DateInput
        display={deadlineToggleValue === "custom" ? "block" : "none"}
        clearable
        label={"Velg frist"}
        valueFormat={"DD/MM/YYYY"}
        placeholder={"DD/MM/YYYY"}
        minDate={moment().subtract(1, "month").format("YYYY-MM-DD")}
        maxDate={moment().add(5, "years").format("YYYY-MM-DD")}
        onChange={(newValue) => {
          const newDeadline = newValue === null ? null : new Date(newValue);
          setDatePickerValue(newDeadline);
          field.handleChange(newDeadline);
        }}
        onBlur={field.handleBlur}
        error={field.state.meta.errors.join(", ")}
      />
    </>
  );
}
