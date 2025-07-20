import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { forwardRef, useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";

type PasswordFieldProps = TextFieldProps & {
  autoComplete: "current-password" | "new-password";
};

// Must forward ref for react-hook-form to work correctly
const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ autoComplete, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => setShowPassword((previous) => !previous);
    const [password, setPassword] = useState("");

    return (
      <>
        <TextField
          required
          margin="normal"
          fullWidth
          label="Passord"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete={autoComplete}
          ref={ref}
          {...props}
          onChange={(event) => {
            setPassword(event.target.value);
            if (props.onChange) {
              props.onChange(event);
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip
                    title={showPassword ? "Skjul passord" : "Vis passord"}
                  >
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
        {autoComplete === "new-password" && (
          <PasswordStrengthBar
            password={password}
            minLength={10}
            shortScoreWord={"for kort"}
            scoreWords={["svakt", "svakt", "ok", "stekt", "veldig sterkt"]}
          />
        )}
      </>
    );
  },
);
PasswordField.displayName = "PasswordField";

export default PasswordField;
