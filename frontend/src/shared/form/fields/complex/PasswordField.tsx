import { PasswordInput, PasswordInputProps } from "@mantine/core";

import { useFieldContext } from "@/shared/form/hooks";

export function passwordFieldValidator(value: string) {
  if (!value) return "Du må fylle inn passord";
  return null;
}

export default function PasswordField(props: PasswordInputProps) {
  const field = useFieldContext<string>();
  return (
    <PasswordInput
      required
      label={"Ditt passord"}
      type={"password"}
      autoComplete={"current-password"}
      placeholder={"correct horse battery staple"}
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
