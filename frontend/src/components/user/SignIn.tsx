"use client";
import { Alert, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import validator from "validator";

import { isLoggedIn } from "@/api/auth";
import { addAccessToken, addRefreshToken } from "@/api/token";
import { executeReturnRedirect } from "@/components/AuthLinker";
import DynamicLink from "@/components/DynamicLink";
import FacebookButton from "@/components/user/FacebookButton";
import PasswordField from "@/components/user/fields/PasswordField";
import GoogleButton from "@/components/user/GoogleButton";
import { apiClient } from "@/utils/api/apiClient";

interface SignInFields {
  username: string;
  password: string;
}

export default function SignIn() {
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFields>({ mode: "onTouched" });

  const onSubmit: SubmitHandler<SignInFields> = async ({
    username,
    password,
  }) => {
    setLoading(true);
    setApiError("");
    try {
      const { data, status } = await apiClient.auth.local.login.$post({
        username,
        password,
      });
      if (status === 200 && data) {
        addAccessToken(data.accessToken);
        addRefreshToken(data.refreshToken);
        executeReturnRedirect(searchParams, router);
        return;
      }
      setApiError(
        status === 401
          ? "Feil brukernavn eller passord"
          : "Noe gikk galt! Prøv igjen eller ta kontakt dersom problemet vedvarer.",
      );
    } catch {
      setApiError(
        "Noe gikk galt! Prøv igjen eller ta kontakt dersom problemet vedvarer.",
      );
    }
    setLoading(false);
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

        <Divider sx={{ width: "100%", my: 3 }}>eller</Divider>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          {apiError && (
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              {apiError}
            </Alert>
          )}
          {Object.entries(errors).map(([type, message]) => (
            <Alert key={type} severity="error" sx={{ mt: 1, mb: 2 }}>
              {message.message}
            </Alert>
          ))}
          <TextField
            required
            fullWidth
            id="username"
            label="E-post eller telefonnummer"
            autoComplete="username"
            {...register("username", {
              validate: (v) =>
                !v || validator.isEmail(v) || validator.isMobilePhone(v)
                  ? true
                  : "Du må fylle inn gyldig e-post eller telefonnummer",
            })}
          />
          <PasswordField
            autoComplete="current-password"
            {...register("password")}
          />
          <Button
            loading={loading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Logg inn
          </Button>
          <Stack justifyContent={"space-between"} direction={"row"}>
            <DynamicLink href={"/auth/forgot"}>Glemt passord?</DynamicLink>
            <DynamicLink href={"/auth/register"}>
              Har du ikke konto? Registrer deg
            </DynamicLink>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
