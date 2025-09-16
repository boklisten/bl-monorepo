import { TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "@/shared/form/hooks";

export default function TextField(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
