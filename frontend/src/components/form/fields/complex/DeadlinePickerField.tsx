import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";

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

  return [
    {
      value: winterDeadline.toString(),
      label: dayjs(winterDeadline).format("DD/MM/YYYY"),
    },
    {
      value: summerDeadline.toString(),
      label: dayjs(summerDeadline).format("DD/MM/YYYY"),
    },
  ] as const satisfies { value: string; label: string }[];
}

export default function DeadlinePickerField() {
  const field = useFieldContext<Date | null>();
  return (
    <DatePickerInput
      presets={calculateDeadlineOptions()}
      clearable
      label={"Velg frist"}
      valueFormat={"DD/MM/YYYY"}
      placeholder={"DD/MM/YYYY"}
      minDate={dayjs().subtract(1, "month").toDate()}
      maxDate={dayjs().add(5, "years").toDate()}
      onChange={(newValue) => {
        field.handleChange(newValue === null ? null : new Date(newValue));
      }}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
