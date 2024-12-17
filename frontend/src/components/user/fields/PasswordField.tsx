import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { forwardRef, useState } from "react";

type PasswordFieldProps = TextFieldProps & {
  autoComplete: "current-password" | "new-password";
};

// Must forward ref for react-hook-form to work correctly
const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ autoComplete, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => setShowPassword((previous) => !previous);

    return (
      <TextField
        data-testid="password-field"
        required
        margin="normal"
        fullWidth
        label="Passord"
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete={autoComplete}
        ref={ref}
        {...props}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? "Skjul passord" : "Vis passord"}>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
);
PasswordField.displayName = "PasswordField";

export default PasswordField;
