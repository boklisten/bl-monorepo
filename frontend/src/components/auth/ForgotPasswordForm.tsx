"use client";

import { Anchor, Button, Stack } from "@mantine/core";
import { IconMailFast } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import validator from "validator";

import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import SuccessAlert from "@/components/ui/alerts/SuccessAlert";
import { useAppForm } from "@/hooks/form";
import { GENERIC_ERROR_TEXT, PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
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
    onError: () => setApiError(PLEASE_TRY_AGAIN_TEXT),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => requestPasswordResetMutation.mutate(value),
  });

  return (
    <>
      <Stack>
        {apiError && (
          <ErrorAlert title={GENERIC_ERROR_TEXT}>{apiError}</ErrorAlert>
        )}
        {requestPasswordResetMutation.isSuccess && !apiError && (
          <SuccessAlert icon={<IconMailFast />}>
            Vi har sendt en e-post med instruksjoner for hvordan du kan endre
            passordet ditt. Hvis e-posten ikke dukker opp innen noen få minutter
            anbefaler vi å sjekke søppelpost.
          </SuccessAlert>
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
    </>
  );
}
