"use client";
import { resetPassword } from "@frontend/api/user";
import DynamicLink from "@frontend/components/DynamicLink";
import { assertBlApiError } from "@frontend/utils/types";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface PasswordResetFields {
  password: string;
}

export default function PasswordReset({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFields>({ mode: "onTouched" });
  const onSubmit: SubmitHandler<PasswordResetFields> = async (data) => {
    setApiError("");
    try {
      await resetPassword(
        userId,
        searchParams.get("resetToken") ?? "",
        data.password,
      );
    } catch (error) {
      if (assertBlApiError(error)) {
        setApiError(
          "Klarte ikke sette nytt passord. Lenken kan være utløpt. Prøv igjen eller ta kontakt dersom problemet vedvarer.",
        );
        return;
      }
    }
    setSuccess(true);
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
    >
      {success ? (
        <Stack
          sx={{
            alignItems: "center",
            gap: 2,
            mt: 1,
          }}
        >
          <Alert severity="success">
            Passordet ble oppdatert! Du kan nå logge inn.
          </Alert>
          <DynamicLink href={"/auth/login"}>
            <Button variant="contained">Logg inn</Button>
          </DynamicLink>
        </Stack>
      ) : (
        <>
          {apiError && (
            <Alert severity="error" data-testid="api-error" sx={{ mt: 1 }}>
              {apiError}
            </Alert>
          )}
          {Object.entries(errors).map(([type, message]) => (
            <Alert
              key={type}
              severity="error"
              sx={{ mt: 1 }}
              data-testid="error-message"
            >
              {message.message}
            </Alert>
          ))}
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <TextField
              data-testid="password-field"
              required
              margin="normal"
              fullWidth
              label="Nytt passord"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              error={!!errors.password}
              {...register("password", {
                required: "Du må fylle inn nytt passord",
                minLength: {
                  value: 10,
                  message: "Passordet må minst ha 10 tegn",
                },
              })}
            />
            <InputAdornment
              position="end"
              sx={{ position: "absolute", mr: 1, mt: 1 }}
            >
              <Tooltip title={showPassword ? "Skjul passord" : "Vis passord"}>
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          </Box>
          <Button
            data-testid="password-reset-submit"
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, textTransform: "none" }}
          >
            Lag nytt passord
          </Button>
          <Grid container>
            <Grid item>
              <DynamicLink href={"/auth/login"}>
                Tilbake til innloggingssiden
              </DynamicLink>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
