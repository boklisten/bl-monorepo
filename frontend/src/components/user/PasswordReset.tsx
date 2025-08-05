"use client";
import { Alert, Stack, Box } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import DynamicLink from "@/components/DynamicLink";
import PasswordField from "@/components/user/fields/PasswordField";
import { publicApiClient } from "@/utils/api/publicApiClient";

interface PasswordResetFields {
  password: string;
}

export default function PasswordReset({ resetId }: { resetId: string }) {
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState<string | null>(null);
  const methods = useForm<PasswordResetFields>();
  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const resetValidation = useQuery({
    queryKey: [publicApiClient.reset_password.validate.$url(), resetId],
    queryFn: () =>
      publicApiClient.reset_password.validate.$post({
        resetId,
        resetToken: searchParams.get("resetToken") ?? "",
      }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: PasswordResetFields) => {
      setApiError(null);
      const { message } = await publicApiClient.reset_password
        .$post({
          resetId,
          resetToken: searchParams.get("resetToken") ?? "",
          newPassword: password,
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

  const message = resetValidation.data?.data?.message;
  const isExpired = message || resetValidation.isError;
  if (isExpired) {
    return (
      <>
        <Alert severity="error" sx={{ my: 1 }}>
          {message ??
            "Lenken har utløpt. Du kan be om å få tilsendt en ny lenke på 'glemt passord'-siden foo"}
        </Alert>
        <DynamicLink href={"/auth/forgot"} underline={"none"}>
          Gå til glemt passord
        </DynamicLink>
      </>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((data) => resetPasswordMutation.mutate(data))}
      sx={{ width: "100%" }}
    >
      {resetPasswordMutation.isSuccess && !apiError ? (
        <Stack
          sx={{
            alignItems: "center",
            gap: 2,
            mt: 1,
          }}
        >
          <Alert severity="success">
            Passordet ble oppdatert! Du kan nå logge inn.
          </Alert>
          <DynamicLink href={"/auth/login"}>
            <Button variant="contained">Logg inn</Button>
          </DynamicLink>
        </Stack>
      ) : (
        <>
          {apiError && (
            <Alert severity="error" sx={{ my: 2 }}>
              {apiError}
            </Alert>
          )}
          {Object.entries(errors).map(([type, message]) => (
            <Alert key={type} severity="error" sx={{ my: 2 }}>
              {message.message}
            </Alert>
          ))}
          <FormProvider {...methods}>
            <PasswordField
              label={"Nytt passord"}
              autoComplete={"new-password"}
            />
          </FormProvider>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, textTransform: "none" }}
          >
            Lag nytt passord
          </Button>
          <Grid container>
            <Grid>
              <DynamicLink href={"/auth/login"}>
                Tilbake til innloggingssiden
              </DynamicLink>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
