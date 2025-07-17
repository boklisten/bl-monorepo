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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import DynamicLink from "@/components/DynamicLink";
import { publicApiClient } from "@/utils/api/publicApiClient";

interface PasswordResetFields {
  password: string;
}

export default function PasswordReset({ resetId }: { resetId: string }) {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFields>();

  const resetValidation = useQuery({
    queryKey: [publicApiClient.reset_password.validate.$url(), resetId],
    queryFn: () =>
      publicApiClient.reset_password.validate.$post({
        resetId,
        resetToken: searchParams.get("resetToken") ?? "",
      }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: PasswordResetFields) => {
      setApiError(null);
      const { message } = await publicApiClient.reset_password
        .$post({
          resetId,
          resetToken: searchParams.get("resetToken") ?? "",
          newPassword: password,
        })
        .unwrap();
      setApiError(message ?? null);
    },
    onError: () => {
      setApiError(
        "Noe gikk galt! Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer.",
      );
    },
  });

  const message = resetValidation.data?.data?.message;
  const isExpired = message || resetValidation.isError;
  if (isExpired) {
    return (
      <>
        <Alert severity="error" sx={{ my: 1 }}>
          {message ??
            "Lenken har utløpt. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden foo"}
        </Alert>
        <DynamicLink href={"/auth/forgot"} underline={"none"}>
          Gå til glemt passord
        </DynamicLink>
      </>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((data) => resetPasswordMutation.mutate(data))}
      sx={{ width: "100%" }}
    >
      {resetPasswordMutation.isSuccess && !apiError ? (
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
