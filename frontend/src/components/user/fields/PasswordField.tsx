import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import PasswordStrengthBar from "react-password-strength-bar";

import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function PasswordField({
  label,
  autoComplete,
}: {
  label: string;
  autoComplete: "current-password" | "new-password";
}) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<UserEditorFields>();

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((previous) => !previous);
  const [password, setPassword] = useState("");

  return (
    <>
      <TextField
        required
        margin={autoComplete === "new-password" ? "none" : "normal"}
        fullWidth
        label={label}
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete={autoComplete}
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
        error={!!errors.password}
        {...register("password", fieldValidators.password)}
        onChange={(event) => {
          setPassword(event.target.value);
          setValue("password", event.target.value);
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
}
