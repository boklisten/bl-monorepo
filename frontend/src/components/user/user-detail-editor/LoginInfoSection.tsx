import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { QrCode } from "@mui/icons-material";
import { Button, Dialog, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { DialogProps, useDialogs } from "@toolpad/core";
import QRCode from "react-qr-code";

import EmailConfirmationStatus from "@/components/user/fields/EmailConfirmationStatus";
import EmailField from "@/components/user/fields/EmailField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PasswordField from "@/components/user/fields/PasswordField";
import { UserDetailsEditorVariant } from "@/components/user/user-detail-editor/UserDetailsEditor";

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
  emailVerified,
  userDetails,
}: {
  variant: UserDetailsEditorVariant;
  emailVerified: boolean | undefined;
  userDetails: UserDetail;
}) {
  const dialogs = useDialogs();

  return (
    <>
      <Grid size={{ xs: 12 }}>
        <EmailField
          disabled={variant === "personal" || variant === "administrate"} // fixme: enable in administrate but note that we also need to update the users table
          helperText={
            variant === "personal"
              ? "Ta kontakt dersom du ønsker å endre e-postadresse"
              : ""
          }
          isEmailVerified={emailVerified}
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
