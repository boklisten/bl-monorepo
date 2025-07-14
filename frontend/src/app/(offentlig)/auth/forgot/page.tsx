"use client";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Typography,
  TextField,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import validator from "validator";

import DynamicLink from "@/components/DynamicLink";
import useApiClient from "@/utils/api/useApiClient";

interface ForgotFields {
  email: string;
}

const ForgotPage = () => {
  const client = useApiClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFields>({ mode: "onTouched" });
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const onSubmit: SubmitHandler<ForgotFields> = async (data) => {
    try {
      setError(false);
      setSuccess(false);
      await client["forgot-password"].$post({ email: data.email }).unwrap();
      setSuccess(true);
    } catch {
      setError(true);
    }
  };
  return (
    <>
      <title>Glemt passord | Boklisten.no</title>
      <meta
        name="description"
        content="Har du glemt passordet ditt? Få hjep til å opprette et nytt!"
      />
      <Card sx={{ paddingBottom: 4 }}>
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h1">Glemt passord</Typography>
            <Typography sx={{ mt: 1 }}>
              Skriv inn din e-postadresse, så sender vi deg en lenke slik at du
              kan nullstille passordet ditt.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: "100%" }}
            >
              {Object.entries(errors).map(([type, message]) => (
                <Alert key={type} severity="error">
                  {message.message}
                </Alert>
              ))}
              {error && (
                <Alert severity="error">
                  Noe gikk galt, vi kunne ikke sende nullstillingslenke. Er du
                  sikker på at du har skrevet inn korrekt e-postadresse?
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Hvis det finnes en bruker med denne e-postaddressen har vi
                  sendt en e-post med instruksjoner for hvordan du kan endre
                  passordet ditt. Hvis e-posten ikke dukker opp innen noen få
                  minutter anbefaler vi å sjekke søppelpost.
                </Alert>
              )}
              <TextField
                required
                margin="normal"
                fullWidth
                id="email"
                label="E-post"
                autoComplete="email"
                error={!!errors.email}
                {...register("email", {
                  required: "Du må fylle inn e-post",
                  validate: (v) =>
                    validator.isEmail(v)
                      ? true
                      : "Du må fylle inn en gyldig e-post",
                })}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={Object.entries(errors).length > 0}
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
          </Box>
        </Container>
      </Card>
    </>
  );
};

export default ForgotPage;
