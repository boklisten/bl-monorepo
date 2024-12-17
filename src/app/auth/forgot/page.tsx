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
import isEmail from "validator/lib/isEmail";

import BlFetcher from "@/api/blFetcher";
import DynamicLink from "@/components/DynamicLink";
import blConfig from "@/utils/bl-config";

interface ForgotFields {
  email: string;
}

const ForgotPage = () => {
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
      await BlFetcher.post(blConfig.collection.pendingPasswordReset, {
        email: data.email,
      });
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
                <Alert key={type} severity="error" data-testid="error-message">
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
                  passordet ditt.
                </Alert>
              )}
              <TextField
                data-testid="email-field"
                required
                margin="normal"
                fullWidth
                id="email"
                label="Epost"
                autoComplete="email"
                error={!!errors.email}
                {...register("email", {
                  required: "Du må fylle inn epost",
                  validate: (v) =>
                    isEmail(v) ? true : "Du må fylle inn en gyldig epost",
                })}
              />
              <Button
                data-testid="forgot-submit"
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={Object.entries(errors).length > 0}
              >
                Reset passord
              </Button>
              <Grid container>
                <Grid item>
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
