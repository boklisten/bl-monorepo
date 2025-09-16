"use client";
import { Anchor, Button } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import SuccessAlert from "@/shared/components/alerts/SuccessAlert";
import { newPasswordFieldValidator } from "@/shared/components/form/fields/complex/NewPasswordField";
import { useAppForm } from "@/shared/hooks/form";
import { publicApiClient } from "@/shared/hooks/publicApiClient";
import {
  GENERIC_ERROR_TEXT,
  PLEASE_TRY_AGAIN_TEXT,
} from "@/shared/utils/constants";

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
      setApiError(PLEASE_TRY_AGAIN_TEXT);
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
        <ErrorAlert>
          {message ??
            "Lenken har utløpt. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden"}
        </ErrorAlert>
        <Anchor component={Link} href={"/auth/forgot"}>
          Gå til glemt passord
        </Anchor>
      </>
    );
  }

  return resetPasswordMutation.isSuccess && !apiError ? (
    <>
      <SuccessAlert>Passordet ble oppdatert! Du kan nå logge inn.</SuccessAlert>
      <Anchor component={Link} href={"/auth/login"}>
        <Button>Logg inn</Button>
      </Anchor>
    </>
  ) : (
    <>
      {apiError && (
        <ErrorAlert title={GENERIC_ERROR_TEXT}>{apiError}</ErrorAlert>
      )}
      <form.AppField
        name={"newPassword"}
        validators={{
          onBlur: ({ value }) => newPasswordFieldValidator(value),
        }}
      >
        {(field) => <field.NewPasswordField label={"Nytt passord"} />}
      </form.AppField>
      <Button onClick={form.handleSubmit}>Lag nytt passord</Button>
      <Anchor component={Link} href={"/auth/login"}>
        Tilbake til innloggingssiden
      </Anchor>
    </>
  );
}
