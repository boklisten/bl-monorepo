"use client";
import { Alert, Anchor, Button } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import ErrorAlert from "@/components/ui/ErrorAlert";
import { useAppForm } from "@/hooks/form";
import { publicApiClient } from "@/utils/publicApiClient";

interface PasswordResetFields {
  newPassword: string;
}

export default function PasswordReset({ resetId }: { resetId: string }) {
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState<string | null>(null);

  const resetValidation = useQuery({
    queryKey: [publicApiClient.reset_password.validate.$url(), resetId],
    queryFn: () =>
      publicApiClient.reset_password.validate.$post({
        resetId,
        resetToken: searchParams.get("resetToken") ?? "",
      }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: PasswordResetFields) => {
      setApiError(null);
      const { message } = await publicApiClient.reset_password
        .$post({
          resetId,
          resetToken: searchParams.get("resetToken") ?? "",
          newPassword,
        })
        .unwrap();
      setApiError(message ?? null);
    },
    onError: () => {
      setApiError(
        "Noe gikk galt! Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer.",
      );
    },
  });

  const form = useAppForm({
    defaultValues: {
      newPassword: "",
    },
    onSubmit: async ({ value }) => resetPasswordMutation.mutate(value),
  });

  const message = resetValidation.data?.data?.message;
  const isExpired = message || resetValidation.isError;
  if (isExpired) {
    return (
      <>
        <ErrorAlert
          message={
            message ??
            "Lenken har utløpt. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden"
          }
        ></ErrorAlert>
        <Anchor component={Link} href={"/auth/forgot"}>
          Gå til glemt passord
        </Anchor>
      </>
    );
  }

  return (
    <form.AppForm>
      {resetPasswordMutation.isSuccess && !apiError ? (
        <>
          <Alert icon={<IconCircleCheck />} color={"green"}>
            Passordet ble oppdatert! Du kan nå logge inn.
          </Alert>
          <Anchor component={Link} href={"/auth/login"}>
            <Button>Logg inn</Button>
          </Anchor>
        </>
      ) : (
        <>
          {apiError && <ErrorAlert message={apiError} />}
          <form.AppField
            name={"newPassword"}
            validators={{
              onBlur: ({ value }) =>
                value.length < 10 ? "Passordet må ha minst 10 tegn" : null,
            }}
          >
            {(field) => <field.NewPasswordInputField label={"Nytt passord"} />}
          </form.AppField>
          <Button onClick={form.handleSubmit}>Lag nytt passord</Button>
          <Anchor component={Link} href={"/auth/login"}>
            Tilbake til innloggingssiden
          </Anchor>
        </>
      )}
    </form.AppForm>
  );
}
