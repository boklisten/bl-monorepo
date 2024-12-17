import { InputAdornment, TextFieldProps } from "@mui/material";
import TextField from "@mui/material/TextField";
import { forwardRef, Ref } from "react";

const PhoneNumberField = forwardRef(
  (props: TextFieldProps, ref: Ref<HTMLInputElement>) => (
    <TextField
      data-testid="phone-field"
      required
      fullWidth
      label="Telefonnummer"
      id="phoneNumber"
      autoComplete="tel-national"
      inputRef={ref}
      {...props}
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">+47</InputAdornment>,
        },

        htmlInput: {
          inputMode: "numeric",
          pattern: "[0-9]{8}",
        },
      }}
    />
  ),
);
PhoneNumberField.displayName = "PhoneNumberField";

export default PhoneNumberField;
