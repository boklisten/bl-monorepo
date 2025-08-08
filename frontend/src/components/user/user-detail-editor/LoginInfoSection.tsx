import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { QrCode } from "@mui/icons-material";
import { Alert, Button, Dialog, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { DialogProps, useDialogs } from "@toolpad/core";
import { useFormContext, useWatch } from "react-hook-form";
import QRCode from "react-qr-code";

import EmailConfirmationStatus from "@/components/user/fields/EmailConfirmationStatus";
import EmailField from "@/components/user/fields/EmailField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PasswordField from "@/components/user/fields/PasswordField";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";

function CustomerIdDialog({
  open,
  onClose,
  payload: { detailsId },
}: DialogProps<{ detailsId: string }>) {
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <QRCode value={detailsId} />
    </Dialog>
  );
}

export default function LoginInfoSection({
  variant,
  userDetails,
}: {
  variant: UserDetailsEditorVariant;
  userDetails: UserDetail;
}) {
  const dialogs = useDialogs();
  const { control } = useFormContext<UserEditorFields>();
  const email = useWatch({ control, name: "email" });
  const isSchoolEmail =
    email &&
    [
      "osloskolen.no",
      "sonans.no",
      "wangelev.no",
      "edu.nki.no",
      "stud.akademiet.no",
      "elev.ottotreider.no",
    ].some((domain) => email.includes(domain));

  return (
    <>
      <Grid size={{ xs: 12 }}>
        {variant === "signup" && isSchoolEmail && (
          <Alert severity={"warning"} sx={{ mb: 1 }}>
            Vi anbefaler at du bruker din personlige e-postadresse i stedet for
            skolekontoen. Da beholder du tilgangen etter endt utdanning og kan
            motta viktige varsler om eventuelle manglende bokinnleveringer.
          </Alert>
        )}
        <EmailField
          disabled={variant === "personal"}
          helperText={
            variant === "personal"
              ? "Ta kontakt dersom du ønsker å endre e-postadresse"
              : ""
          }
        />
        <EmailConfirmationStatus userDetails={userDetails} variant={variant} />
        <FieldErrorAlert field={"email"} />
      </Grid>
      {variant === "personal" && (
        <Stack
          alignItems={"center"}
          sx={{ width: "100%", textTransform: "none" }}
        >
          <Button
            variant={"contained"}
            startIcon={<QrCode />}
            onClick={() =>
              dialogs.open(CustomerIdDialog, { detailsId: userDetails.id })
            }
          >
            Vis kunde-ID
          </Button>
        </Stack>
      )}
      {variant === "signup" && (
        <Grid size={{ xs: 12 }}>
          <PasswordField label={"Passord"} autoComplete="new-password" />
          <FieldErrorAlert field={"password"} />
        </Grid>
      )}
    </>
  );
}
