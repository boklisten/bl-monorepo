"use client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Box,
} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import DynamicLink from "@/components/DynamicLink";
import { publicApiClient } from "@/utils/api/publicApiClient";

interface PasswordResetFields {
  password: string;
}

export default function PasswordReset({ resetId }: { resetId: string }) {
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
      await publicApiClient["reset-password"]
        .$post({
          resetId,
          resetToken: searchParams.get("resetToken") ?? "",
          newPassword: data.password,
        })
        .unwrap();

      setSuccess(true);
    } catch {
      setApiError(
        "Klarte ikke sette nytt passord. Lenken kan være utløpt. Prøv igjen eller ta kontakt dersom problemet vedvarer.",
      );
      setSuccess(false);
    }
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
            <Alert severity="error" sx={{ mt: 1 }}>
              {apiError}
            </Alert>
          )}
          {Object.entries(errors).map(([type, message]) => (
            <Alert key={type} severity="error" sx={{ mt: 1 }}>
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
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, textTransform: "none" }}
          >
            Lag nytt passord
          </Button>
          <Grid container>
            <Grid>
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
