"use client";

import { Alert, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import CountdownToRedirect from "@/components/CountdownToRedirect";
import DynamicLink from "@/components/DynamicLink";
import { publicApiClient } from "@/utils/api/publicApiClient";

export default function EmailConfirmer({
  confirmationId,
}: {
  confirmationId: string;
}) {
  const [status, setStatus] = useState<"WAIT" | "SUCCESS" | "ERROR">("WAIT");

  useEffect(() => {
    async function validateEmail(confirmationId: string) {
      try {
        await publicApiClient
          .email_validations({ id: confirmationId })
          .$get()
          .unwrap();
        setStatus("SUCCESS");
      } catch {
        setStatus("ERROR");
      }
    }
    void validateEmail(confirmationId);
  }, [confirmationId]);

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
