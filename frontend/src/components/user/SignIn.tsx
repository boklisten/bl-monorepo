"use client";
import { Alert, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";

import { addAccessToken, addRefreshToken } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import FacebookButton from "@/components/user/FacebookButton";
import PasswordField from "@/components/user/fields/PasswordField";
import GoogleButton from "@/components/user/GoogleButton";
import VippsButton from "@/components/user/VippsButton";
import { publicApiClient } from "@/utils/api/publicApiClient";
import { isProduction } from "@/utils/env";
import useAuth from "@/utils/useAuth";
import useAuthLinker from "@/utils/useAuthLinker";

interface SignInFields {
  username: string;
  password: string;
}

export default function SignIn() {
  const [apiError, setApiError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const { redirectToCaller } = useAuthLinker();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFields>({ mode: "onTouched" });

  const signInMutation = useMutation({
    mutationFn: async ({ username, password }: SignInFields) => {
      setApiError(null);
      const { message, tokens } = await publicApiClient.auth.local.login
        .$post({
          username,
          password,
        })
        .unwrap();
      setApiError(message ?? null);
      if (tokens) {
        addAccessToken(tokens.accessToken);
        addRefreshToken(tokens.refreshToken);
        redirectToCaller();
      }
    },
    onError: () =>
      setApiError(
        "Noe gikk galt! Prøv igjen eller ta kontakt dersom problemet vedvarer.",
      ),
  });

  useEffect(() => {
    // Next might have valid tokens, even though bl-web and bl-admin might not. If so, the user is redirected automatically
    if (isLoggedIn) {
      redirectToCaller();
    }
  }, [redirectToCaller, isLoggedIn]);

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
        <Stack gap={2} sx={{ width: "100%", alignItems: "center" }}>
          <VippsButton verb={"login"} />
          {isProduction() && ( // fixme: remove once Google and Facebook logins are approved for removal
            <>
              <FacebookButton label={"Logg inn med Facebook"} />
              <GoogleButton label={"Logg inn med Google"} />
            </>
          )}
        </Stack>

        <Divider sx={{ width: "100%", my: 3 }}>eller</Divider>
        <Box
          component="form"
          onSubmit={handleSubmit((data) => signInMutation.mutate(data))}
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
            loading={signInMutation.isPending}
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
