"use client";
import { Alert, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import validator from "validator";

import { addAccessToken, addRefreshToken } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import PasswordField from "@/components/user/fields/PasswordField";
import useAuth from "@/hooks/useAuth";
import useAuthLinker from "@/hooks/useAuthLinker";
import { publicApiClient } from "@/utils/publicApiClient";

interface SignInFields {
  username: string;
  password: string;
}

export default function LocalSignIn() {
  const [apiError, setApiError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const { redirectToCaller } = useAuthLinker();
  const methods = useForm<SignInFields>({ mode: "onTouched" });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

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
    <>
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
        <FormProvider {...methods}>
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
          <PasswordField label={"Passord"} autoComplete="current-password" />
        </FormProvider>
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
    </>
  );
}
