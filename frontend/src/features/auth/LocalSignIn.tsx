"use client";
import { Button, Group } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import validator from "validator";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import { passwordFieldValidator } from "@/shared/components/form/fields/complex/PasswordField";
import NextAnchor from "@/shared/components/NextAnchor";
import { useAppForm } from "@/shared/hooks/form";
import useAuth from "@/shared/hooks/useAuth";
import useAuthLinker from "@/shared/hooks/useAuthLinker";
import {
  GENERIC_ERROR_TEXT,
  PLEASE_TRY_AGAIN_TEXT,
} from "@/shared/utils/constants";
import { publicApiClient } from "@/shared/utils/publicApiClient";
import { addAccessToken, addRefreshToken } from "@/shared/utils/token";

interface SignInFields {
  username: string;
  password: string;
}

export default function LocalSignIn() {
  const [apiError, setApiError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const { redirectToCaller } = useAuthLinker();

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
    onError: () => setApiError(PLEASE_TRY_AGAIN_TEXT),
  });

  const form = useAppForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: ({ value }) => signInMutation.mutate(value),
  });

  useEffect(() => {
    // Next might have valid tokens, even though bl-admin might not. If so, the user is redirected automatically
    if (isLoggedIn) {
      redirectToCaller();
    }
  }, [redirectToCaller, isLoggedIn]);

  return (
    <>
      {apiError && (
        <ErrorAlert title={GENERIC_ERROR_TEXT}>{apiError}</ErrorAlert>
      )}
      <form.AppField
        name={"username"}
        validators={{
          onBlur: ({ value }) => {
            return (!validator.isEmail(value) &&
              !validator.isMobilePhone(value, "nb-NO")) ||
              value.includes("+47")
              ? "Du må fylle inn gyldig e-post eller telefonnummer (uten +47)"
              : null;
          },
        }}
      >
        {(field) => (
          <field.TextField
            required
            label={"Brukernavn"}
            placeholder={"E-post eller telefonnummer"}
            autoComplete={"username"}
          />
        )}
      </form.AppField>
      <form.AppField
        name={"password"}
        validators={{
          onBlur: ({ value }) => passwordFieldValidator(value),
        }}
      >
        {(field) => <field.PasswordField />}
      </form.AppField>
      <Button onClick={form.handleSubmit} loading={signInMutation.isPending}>
        Logg inn
      </Button>
      <Group justify={"space-between"}>
        <NextAnchor size={"sm"} href={"/auth/forgot"}>
          Glemt passord?
        </NextAnchor>
        <NextAnchor size={"sm"} href={"/auth/register"}>
          Har du ikke konto? Registrer deg
        </NextAnchor>
      </Group>
    </>
  );
}
