"use client";

import BlFetcher from "@frontend/api/blFetcher";
import CountdownToRedirect from "@frontend/components/CountdownToRedirect";
import DynamicLink from "@frontend/components/DynamicLink";
import BL_CONFIG from "@frontend/utils/bl-config";
import { Alert, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";

function validateEmail(confirmationId: string) {
  return BlFetcher.patch(
    `${BL_CONFIG.collection.emailValidation}/${confirmationId}/${BL_CONFIG.emailValidation.confirm.operation}`,
    {},
  );
}

export default function EmailConfirmer({
  confirmationId,
}: {
  confirmationId: string;
}) {
  const [status, setStatus] = useState<"WAIT" | "SUCCESS" | "ERROR">("WAIT");

  useEffect(() => {
    validateEmail(confirmationId)
      .then(() => {
        return setStatus("SUCCESS");
      })
      .catch((error) => {
        console.error(error);
        setStatus("ERROR");
      });
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
