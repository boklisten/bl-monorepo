"use client";
import { Anchor, Button, Group } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import validator from "validator";

import { addAccessToken, addRefreshToken } from "@/features/auth/token";
import useAuth from "@/features/auth/useAuth";
import useAuthLinker from "@/features/auth/useAuthLinker";
import { publicApiClient } from "@/shared/api/publicApiClient";
import { passwordFieldValidator } from "@/shared/form/fields/complex/PasswordField";
import { useAppForm } from "@/shared/form/hooks";
import ErrorAlert from "@/shared/ui/components/alerts/ErrorAlert";
import {
  GENERIC_ERROR_TEXT,
  PLEASE_TRY_AGAIN_TEXT,
} from "@/shared/utils/constants";

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
    // Next might have valid tokens, even though bl-web and bl-admin might not. If so, the user is redirected automatically
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
        <Anchor size={"sm"} component={Link} href={"/auth/forgot"}>
          Glemt passord?
        </Anchor>
        <Anchor size={"sm"} component={Link} href={"/auth/register"}>
          Har du ikke konto? Registrer deg
        </Anchor>
      </Group>
    </>
  );
}
