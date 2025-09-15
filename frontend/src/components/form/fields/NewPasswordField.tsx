import { PasswordInput, PasswordInputProps, Stack } from "@mantine/core";
import PasswordStrengthBar from "react-password-strength-bar";

import { useFieldContext } from "@/hooks/form";

export function newPasswordFieldValidator(value: string) {
  if (!value) return "Du må fylle inn et passord";
  if (value.length < 10) return "Passordet må ha minst 10 tegn";

  return null;
}

export default function NewPasswordField(props: PasswordInputProps) {
  const field = useFieldContext<string>();
  return (
    <Stack gap={2}>
      <PasswordInput
        required
        label={"Passord"}
        type={"password"}
        autoComplete={"new-password"}
        placeholder={"correct horse battery staple"}
        {...props}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        error={field.state.meta.errors.join(", ")}
      />
      <PasswordStrengthBar
        password={field.state.value}
        minLength={10}
        shortScoreWord={"for kort"}
        scoreWords={["svakt", "svakt", "ok", "stekt", "veldig sterkt"]}
      />
    </Stack>
  );
}
