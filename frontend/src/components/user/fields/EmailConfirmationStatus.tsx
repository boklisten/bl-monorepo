import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Email, Info } from "@mui/icons-material";
import { Alert } from "@mui/material";
import Button from "@mui/material/Button";
import { useMutation } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";
import useApiClient from "@/utils/api/useApiClient";

interface EmailConfirmationStatusProps {
  variant: UserDetailsEditorVariant;
  userDetails: UserDetail;
}

const EmailConfirmationStatus = ({
  variant,
  userDetails,
}: EmailConfirmationStatusProps) => {
  const { setError } = useFormContext<UserEditorFields>();
  const client = useApiClient();

  const createEmailConfirmation = useMutation({
    mutationFn: () => client.email_validations.$post().unwrap(),
    onError: () =>
      setError("email", {
        message:
          "Klarte ikke sende ny bekreftelseslenke. Vennligst prøv igjen, eller ta kontakt hvis problemet vedvarer.",
      }),
  });

  return (
    variant !== "signup" &&
    !userDetails.emailConfirmed && (
      <>
        {createEmailConfirmation.isSuccess ? (
          <Alert severity={"info"} sx={{ mt: 1 }} icon={<Email />}>
            Bekreftelseslenke er sendt til
            {variant === "personal" ? "din" : "kundens"} e-postadresse! Sjekk
            søppelpost om den ikke dukker opp i inbox.
          </Alert>
        ) : (
          <>
            <Alert severity={"warning"} icon={<Info color={"warning"} />}>
              E-postadressen er ikke bekreftet. En bekreftelseslenke har blitt
              sendt til {userDetails.email}. Trykk på knappen nedenfor for å
              sende en ny lenke.
            </Alert>
            <Button onClick={() => createEmailConfirmation.mutate()}>
              Send bekreftelseslenke på nytt
            </Button>
          </>
        )}
      </>
    )
  );
};

export default EmailConfirmationStatus;
