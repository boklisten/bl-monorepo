"use client";
import { Anchor, Button, Group } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import validator from "validator";

import { addAccessToken, addRefreshToken } from "@/api/token";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { useAppForm } from "@/hooks/form";
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

  const form = useAppForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: ({ value }) => signInMutation.mutate(value),
  });

  useEffect(() => {
    // Next might have valid tokens, even though bl-web and bl-admin might not. If so, the user is redirected automatically
    if (isLoggedIn) {
      redirectToCaller();
    }
  }, [redirectToCaller, isLoggedIn]);

  return (
    <form.AppForm>
      {apiError && <ErrorAlert message={apiError} />}
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
          onBlur: ({ value }) =>
            value.length === 0 ? "Du må fylle inn passord" : null,
        }}
      >
        {(field) => (
          <field.PasswordInputField
            required
            label={"Passord"}
            placeholder={"Ditt passord"}
            autoComplete={"current-password"}
          />
        )}
      </form.AppField>
      <Button onClick={form.handleSubmit} loading={signInMutation.isPending}>
        Logg inn
      </Button>
      <Group justify={"space-between"}>
        <Anchor component={Link} href={"/auth/forgot"}>
          Glemt passord?
        </Anchor>
        <Anchor component={Link} href={"/auth/register"}>
          Har du ikke konto? Registrer deg
        </Anchor>
      </Group>
    </form.AppForm>
  );
}
