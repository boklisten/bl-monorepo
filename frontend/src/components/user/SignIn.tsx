"use client";
import { Alert, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import validator from "validator";

import { isLoggedIn } from "@/api/auth";
import { login } from "@/api/user";
import { executeReturnRedirect } from "@/components/AuthLinker";
import DynamicLink from "@/components/DynamicLink";
import FacebookButton from "@/components/user/FacebookButton";
import PasswordField from "@/components/user/fields/PasswordField";
import GoogleButton from "@/components/user/GoogleButton";
import { assertBlApiError } from "@/utils/types";

interface SignInFields {
  email: string;
  password: string;
}

export default function SignIn() {
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFields>({ mode: "onTouched" });

  const onSubmit: SubmitHandler<SignInFields> = async (data) => {
    setApiError("");
    try {
      await login(data.email, data.password);
    } catch (error) {
      if (assertBlApiError(error)) {
        if (error.code === 908) {
          setApiError("Feil brukernavn eller passord");
          return;
        }
        setApiError(
          "Noe gikk galt! Prøv igjen eller ta kontakt dersom problemet vedvarer.",
        );
      }
      return;
    }
    executeReturnRedirect(searchParams, router);
  };

  useEffect(() => {
    // Next might have valid tokens, even though bl-web and bl-admin might not. If so, the user is redirected automatically
    if (isLoggedIn()) {
      executeReturnRedirect(searchParams, router);
    }
  }, [router, searchParams]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            mb: 2,
          }}
        >
          Logg inn
        </Typography>
        <FacebookButton label={"Logg inn med Facebook"} />
        <GoogleButton label={"Logg inn med Google"} />

        <Divider sx={{ width: "100%", my: 3 }}>
          Eller, logg inn med e-post
        </Divider>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
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
          <TextField
            data-testid="email-field"
            required
            fullWidth
            id="email"
            label="E-post"
            autoComplete="email"
            {...register("email", {
              validate: (v) =>
                !v || validator.isEmail(v)
                  ? true
                  : "Du må fylle inn en gyldig e-post",
            })}
            slotProps={{
              htmlInput: {
                inputMode: "email",
              },
            }}
          />
          <PasswordField
            autoComplete="current-password"
            {...register("password")}
          />
          <Button
            data-testid="login-submit"
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Logg inn
          </Button>
          <Grid container>
            <Grid item xs>
              <DynamicLink href={"/auth/forgot"}>Glemt passord?</DynamicLink>
            </Grid>
            <Grid item>
              <DynamicLink href={"/auth/register"}>
                Har du ikke konto? Registrer deg
              </DynamicLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
