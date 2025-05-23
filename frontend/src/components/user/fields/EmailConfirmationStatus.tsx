import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import { Email, Info } from "@mui/icons-material";
import { Alert } from "@mui/material";
import Button from "@mui/material/Button";
import { useState } from "react";

import BlFetcher from "@/api/blFetcher";
import useApiClient from "@/utils/api/useApiClient";

interface EmailConfirmationStatusProps {
  isSignUp: boolean | undefined;
  userDetails: UserDetail;
  onError: (message: string) => void;
}

const EmailConfirmationStatus = ({
  isSignUp,
  userDetails,
  onError,
}: EmailConfirmationStatusProps) => {
  const client = useApiClient();
  const [emailConfirmationRequested, setEmailConfirmationRequested] =
    useState(false);

  return (
    !isSignUp &&
    !userDetails.emailConfirmed && (
      <>
        {emailConfirmationRequested ? (
          <Alert severity={"info"} sx={{ mt: 1 }} icon={<Email />}>
            Bekreftelseslenke er sendt til din e-postadresse! Sjekk søppelpost
            om den ikke dukker opp i inbox.
          </Alert>
        ) : (
          <>
            <Alert severity={"warning"} icon={<Info color={"warning"} />}>
              E-postadressen din er ikke bekreftet. En bekreftelseslenke har
              blitt sendt til {userDetails.email}. Trykk på knappen nedenfor for
              å sende en ny lenke.
            </Alert>
            <Button
              onClick={async () => {
                try {
                  await BlFetcher.post(
                    client.$url("collection.email_validations.post"),
                    {
                      userDetail: userDetails.id,
                      email: userDetails.email,
                    },
                  );
                  setEmailConfirmationRequested(true);
                } catch {
                  onError(
                    "Klarte ikke sende ny bekreftelseslenke. Vennligst prøv igjen, eller ta kontakt hvis problemet vedvarer.",
                  );
                }
              }}
            >
              Send bekreftelseslenke på nytt
            </Button>
          </>
        )}
      </>
    )
  );
};

export default EmailConfirmationStatus;
