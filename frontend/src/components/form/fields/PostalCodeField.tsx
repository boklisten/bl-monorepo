import { TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "@/hooks/form";

export default function PostalCodeField(props: TextInputProps) {
  const field = useFieldContext<string>();
  // TODO: implement postal city preview and add that value to the form + validate that it is there

  return (
    <TextInput
      required
      label={"Postnummer"}
      placeholder={"2560"}
      autoComplete={"postal-code"}
      inputMode={"numeric"}
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
