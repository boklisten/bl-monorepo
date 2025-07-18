"use client";

import { Alert, CircularProgress, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import CountdownToRedirect from "@/components/CountdownToRedirect";
import DynamicLink from "@/components/DynamicLink";
import { publicApiClient } from "@/utils/api/publicApiClient";

export default function EmailConfirmer({
  confirmationId,
}: {
  confirmationId: string;
}) {
  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: () =>
      publicApiClient.email_validations({ id: confirmationId }).$get().unwrap(),
  });

  useEffect(() => {
    void mutateAsync();
  }, [mutateAsync]);

  return (
    <>
      {isPending && (
        <>
          <Typography variant="h1">Verifiserer e-post...</Typography>
          <CircularProgress />
        </>
      )}
      {isError && (
        <>
          <Alert severity={"error"} sx={{ my: 1 }}>
            Kunne ikke bekrefte e-post. Lenken kan være utløpt. Du kan prøve å
            sende en ny lenke fra brukerinnstillinger.
          </Alert>
          <DynamicLink href={"/user-settings"}>
            Gå til brukerinnstillinger
          </DynamicLink>
        </>
      )}
      {isSuccess && (
        <>
          <Alert sx={{ my: 1 }}>E-postadressen ble bekreftet!</Alert>
          <CountdownToRedirect path={"/"} seconds={5} />
        </>
      )}
    </>
  );
}
