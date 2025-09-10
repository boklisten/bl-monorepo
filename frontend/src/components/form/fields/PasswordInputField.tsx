import { PasswordInput, PasswordInputProps } from "@mantine/core";

import { useFieldContext } from "@/hooks/form";

export default function PasswordInputField(props: PasswordInputProps) {
  const field = useFieldContext<string>();
  return (
    <PasswordInput
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
