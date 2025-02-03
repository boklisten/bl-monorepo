"use client";

import { Alert, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import BlFetcher from "@/api/blFetcher";
import CountdownToRedirect from "@/components/CountdownToRedirect";
import DynamicLink from "@/components/DynamicLink";
import useApiClient from "@/utils/api/useApiClient";

export default function EmailConfirmer({
  confirmationId,
}: {
  confirmationId: string;
}) {
  const client = useApiClient();
  const [status, setStatus] = useState<"WAIT" | "SUCCESS" | "ERROR">("WAIT");

  useEffect(() => {
    function validateEmail(confirmationId: string) {
      return BlFetcher.patch(
        client.$url("collection.email_validations.operation.confirm.patch", {
          params: { id: confirmationId },
        }),
        {},
      );
    }
    validateEmail(confirmationId)
      .then(() => {
        return setStatus("SUCCESS");
      })
      .catch((error) => {
        console.error(error);
        setStatus("ERROR");
      });
  }, [client, confirmationId]);

  return (
    <>
      {status === "WAIT" && (
        <>
          <Typography variant="h1">Verifiserer e-post...</Typography>
          <CircularProgress />
        </>
      )}
      {status === "ERROR" && (
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
      {status === "SUCCESS" && (
        <>
          <Alert sx={{ my: 1 }}>E-postadressen ble bekreftet!</Alert>
          <CountdownToRedirect path={"/"} seconds={5} />
        </>
      )}
    </>
  );
}
