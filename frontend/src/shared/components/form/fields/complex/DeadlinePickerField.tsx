import { DatePickerInput, DatePickerInputProps } from "@mantine/dates";
import dayjs from "dayjs";

import { useFieldContext } from "@/shared/hooks/form";

function calculateDeadlineOptions() {
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

  return usualDates.map((option) => ({
    value: dayjs(option).format("YYYY-MM-DD"),
    label: dayjs(option).format("DD/MM/YYYY"),
  }));
}

export default function DeadlinePickerField(props: DatePickerInputProps) {
  const field = useFieldContext<string | null>();
  return (
    <DatePickerInput
      clearable
      presets={calculateDeadlineOptions()}
      label={"Velg frist"}
      valueFormat={"DD/MM/YYYY"}
      placeholder={"DD/MM/YYYY"}
      minDate={dayjs().subtract(1, "month").toDate()}
      maxDate={dayjs().add(5, "years").toDate()}
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
