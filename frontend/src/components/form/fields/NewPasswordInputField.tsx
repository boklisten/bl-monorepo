import { PasswordInput, PasswordInputProps, Stack } from "@mantine/core";
import PasswordStrengthBar from "react-password-strength-bar";

import { useFieldContext } from "@/hooks/form";

export default function NewPasswordInputField(props: PasswordInputProps) {
  const field = useFieldContext<string>();
  return (
    <Stack gap={2}>
      <PasswordInput
        {...props}
        required
        autoComplete={"new-password"}
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
