"use client";

import { Alert, Anchor, Button, Stack } from "@mantine/core";
import { IconMailFast } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import validator from "validator";

import ErrorAlert from "@/components/ui/ErrorAlert";
import { useAppForm } from "@/hooks/form";
import { publicApiClient } from "@/utils/publicApiClient";

interface ForgotFields {
  email: string;
}

export default function ForgotPasswordForm() {
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

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => requestPasswordResetMutation.mutate(value),
  });

  return (
    <form.AppForm>
      <Stack>
        {apiError && <ErrorAlert message={apiError} />}
        {requestPasswordResetMutation.isSuccess && !apiError && (
          <Alert icon={<IconMailFast />} color={"green"}>
            Vi har sendt en e-post med instruksjoner for hvordan du kan endre
            passordet ditt. Hvis e-posten ikke dukker opp innen noen få minutter
            anbefaler vi å sjekke søppelpost.
          </Alert>
        )}
      </Stack>
      <form.AppField
        name={"email"}
        validators={{
          onBlur: ({ value }) =>
            !validator.isEmail(value)
              ? "Du må fylle inn en gyldig e-post"
              : null,
        }}
      >
        {(field) => (
          <field.TextField
            required
            label={"E-post"}
            placeholder={"Din e-post"}
            autoComplete={"email"}
          />
        )}
      </form.AppField>
      <Button
        loading={requestPasswordResetMutation.isPending}
        onClick={form.handleSubmit}
      >
        Reset passord
      </Button>
      <Anchor component={Link} href={"/auth/login"}>
        Tilbake til innloggingssiden
      </Anchor>
    </form.AppForm>
  );
}
