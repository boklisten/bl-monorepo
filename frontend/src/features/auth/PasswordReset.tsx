import { Button } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Activity, useState } from "react";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import SuccessAlert from "@/shared/components/alerts/SuccessAlert";
import { newPasswordFieldValidator } from "@/shared/components/form/fields/complex/NewPasswordField";
import TanStackAnchor from "@/shared/components/TanStackAnchor.tsx";
import { useAppForm } from "@/shared/hooks/form";
import { GENERIC_ERROR_TEXT, PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import { publicApiClient } from "@/shared/utils/publicApiClient";
import { useLocation } from "@tanstack/react-router";

interface PasswordResetFields {
  newPassword: string;
}

export default function PasswordReset({ resetId }: { resetId: string }) {
  const { resetToken } = useLocation({ select: (location) => location.search });
  const [apiError, setApiError] = useState<string | null>(null);

  const resetValidation = useQuery({
    queryKey: [publicApiClient.reset_password.validate.$url(), resetId],
    queryFn: () =>
      publicApiClient.reset_password.validate.$post({
        resetId,
        resetToken: resetToken ?? "",
      }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: PasswordResetFields) => {
      setApiError(null);
      const { message } = await publicApiClient.reset_password
        .$post({
          resetId,
          resetToken: resetToken ?? "",
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

  return (
    <>
      <Activity mode={isExpired ? "visible" : "hidden"}>
        <ErrorAlert>
          {message ??
            "Lenken har utløpt. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden"}
        </ErrorAlert>
        <TanStackAnchor to={"/auth/forgot"}>Gå til glemt passord</TanStackAnchor>
      </Activity>

      <Activity
        mode={!isExpired && (!resetPasswordMutation.isSuccess || apiError) ? "visible" : "hidden"}
      >
        <Activity mode={apiError ? "visible" : "hidden"}>
          <ErrorAlert title={GENERIC_ERROR_TEXT}>{apiError}</ErrorAlert>
        </Activity>
        <form.AppField
          name={"newPassword"}
          validators={{
            onBlur: ({ value }) => newPasswordFieldValidator(value),
          }}
        >
          {(field) => <field.NewPasswordField label={"Nytt passord"} />}
        </form.AppField>
        <Button onClick={form.handleSubmit}>Lag nytt passord</Button>
        <TanStackAnchor to={"/auth/login"}>Tilbake til innloggingssiden</TanStackAnchor>
      </Activity>

      <Activity
        mode={!isExpired && resetPasswordMutation.isSuccess && !apiError ? "visible" : "hidden"}
      >
        <SuccessAlert>Passordet ble oppdatert! Du kan nå logge inn.</SuccessAlert>
        <TanStackAnchor to={"/auth/login"}>
          <Button>Logg inn</Button>
        </TanStackAnchor>
      </Activity>
    </>
  );
}
