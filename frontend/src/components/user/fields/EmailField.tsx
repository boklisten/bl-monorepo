import { TextFieldProps } from "@mui/material";
import TextField from "@mui/material/TextField";
import { forwardRef, Ref } from "react";

const EmailField = forwardRef(
  (props: Omit<TextFieldProps, "ref">, ref: Ref<HTMLInputElement>) => (
    <TextField
      data-testid="email-field"
      label="E-post"
      required
      fullWidth
      id="email"
      autoComplete="email"
      inputRef={ref}
      {...props}
      slotProps={{
        htmlInput: {
          inputMode: "email",
        },
      }}
    />
  ),
);
EmailField.displayName = "EmailField";

export default EmailField;
