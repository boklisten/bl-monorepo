import { Checkbox, CheckboxProps } from "@mantine/core";

import { useFieldContext } from "@/shared/form/hooks";

export default function CheckboxField(props: CheckboxProps) {
  const field = useFieldContext<boolean>();

  return (
    <Checkbox
      {...props}
      checked={field.state.value}
      onChange={(event) => field.handleChange(event.currentTarget.checked)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
