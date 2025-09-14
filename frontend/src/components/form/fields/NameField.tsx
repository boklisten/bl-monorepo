import { TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "@/hooks/form";

export default function NameField(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      required
      label={"Fullt navn"}
      placeholder={"Reodor Felgen"}
      autoComplete={"name"}
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
