import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Stack, Switch } from "@mui/material";
import Button from "@mui/material/Button";
import { IconMailFast } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";

import InfoAlert from "@/components/ui/alerts/InfoAlert";
import WarningAlert from "@/components/ui/alerts/WarningAlert";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";
import useApiClient from "@/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";

interface EmailConfirmationStatusProps {
  variant: UserDetailsEditorVariant;
  userDetails: UserDetail;
}

const EmailConfirmationStatus = ({
  variant,
  userDetails,
}: EmailConfirmationStatusProps) => {
  const { setError, control } = useFormContext<UserEditorFields>();
  const client = useApiClient();

  const createEmailConfirmation = useMutation({
    mutationFn: () => client.email_validations.$post().unwrap(),
    onError: () =>
      setError("email", {
        message: `Klarte ikke sende ny bekreftelseslenke. ${PLEASE_TRY_AGAIN_TEXT}`,
      }),
  });

  if (variant === "administrate") {
    return (
      <Stack
        direction={"row"}
        sx={{
          mt: 1,
          ml: 0.2,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        E-post bekreftet
        <Controller
          name={"emailVerified"}
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value ?? false}
              onChange={(_, newValue) => field.onChange(newValue)}
            />
          )}
        />
      </Stack>
    );
  }

  return (
    variant !== "signup" &&
    !userDetails.emailConfirmed && (
      <>
        {createEmailConfirmation.isSuccess ? (
          <InfoAlert icon={<IconMailFast />}>
            Bekreftelseslenke er sendt til
            {variant === "personal" ? "din" : "kundens"} e-postadresse! Sjekk
            søppelpost om den ikke dukker opp i inbox.
          </InfoAlert>
        ) : (
          <>
            <WarningAlert title={"E-postadressen er ikke bekreftet"}>
              En bekreftelseslenke har blitt sendt til {userDetails.email}.
              Trykk på knappen nedenfor for å sende en ny lenke.
            </WarningAlert>
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
