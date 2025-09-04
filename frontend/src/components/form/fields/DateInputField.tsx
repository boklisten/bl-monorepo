import { DateInput, DateInputProps } from "@mantine/dates";

import { useFieldContext } from "@/hooks/form";

export default function DateInputField(props: DateInputProps) {
  const field = useFieldContext<string | null>();
  return (
    <DateInput
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
