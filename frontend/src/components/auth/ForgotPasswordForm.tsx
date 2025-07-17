"use client";

import { Alert, Box, Button, Grid, Stack, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";

import DynamicLink from "@/components/DynamicLink";
import { publicApiClient } from "@/utils/api/publicApiClient";

interface ForgotFields {
  email: string;
}

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ForgotFields>({ mode: "onTouched" });

  const [apiError, setApiError] = useState<string | null>(null);

  const requestPasswordResetMutation = useMutation({
    mutationFn: async ({ email }: ForgotFields) => {
      setApiError(null);
      const { message } = await publicApiClient.forgot_password
        .$post({
          email,
        })
        .unwrap();
      setApiError(message ?? null);
    },
    onError: () =>
      setApiError(
        "Noe gikk galt! Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer.",
      ),
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((data) =>
        requestPasswordResetMutation.mutate(data),
      )}
      sx={{ width: "100%" }}
    >
      <Stack mt={1} gap={1}>
        {Object.entries(formErrors).map(([type, message]) => (
          <Alert key={type} severity="error">
            {message.message}
          </Alert>
        ))}
        {apiError && <Alert severity="error">{apiError}</Alert>}
        {requestPasswordResetMutation.isSuccess && !apiError && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Vi har sendt en e-post med instruksjoner for hvordan du kan endre
            passordet ditt. Hvis e-posten ikke dukker opp innen noen få minutter
            anbefaler vi å sjekke søppelpost.
          </Alert>
        )}
      </Stack>
      <TextField
        required
        margin="normal"
        fullWidth
        id="email"
        label="E-post"
        autoComplete="email"
        error={!!formErrors.email}
        {...register("email", {
          required: "Du må fylle inn e-post",
          validate: (v) =>
            validator.isEmail(v) ? true : "Du må fylle inn en gyldig e-post",
        })}
      />
      <Button
        loading={requestPasswordResetMutation.isPending}
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={Object.entries(formErrors).length > 0}
      >
        Reset passord
      </Button>
      <Grid container>
        <Grid>
          <DynamicLink href={"/auth/login"}>
            Tilbake til innloggingssiden
          </DynamicLink>
        </Grid>
      </Grid>
    </Box>
  );
}
