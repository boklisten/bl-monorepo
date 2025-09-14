import { TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "@/hooks/form";

export default function EmailField(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      required
      label={"E-post"}
      placeholder={"reodor@felgen.no"}
      autoComplete={"email"}
      inputMode={"email"}
      type={"email"}
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
