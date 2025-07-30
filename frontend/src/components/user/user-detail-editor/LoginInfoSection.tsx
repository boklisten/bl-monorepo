import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { QrCode } from "@mui/icons-material";
import { Button, Dialog, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import QRCode from "react-qr-code";

import EmailConfirmationStatus from "@/components/user/fields/EmailConfirmationStatus";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import MaybeConfirmedEmailField from "@/components/user/fields/MaybeConfirmedEmailField";
import PasswordField from "@/components/user/fields/PasswordField";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function LoginInfoSection({
  variant,
  emailConfirmed,
  userDetails,
}: {
  variant: UserDetailsEditorVariant;
  emailConfirmed: boolean | undefined;
  userDetails: UserDetail;
}) {
  const { setError } = useFormContext<UserEditorFields>();

  const [customerIdDialogOpen, setCustomerIdDialogOpen] = useState(false);
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <MaybeConfirmedEmailField
          variant={variant}
          isEmailConfirmed={emailConfirmed}
        />
        <EmailConfirmationStatus
          onError={(message) => setError("email", { message })}
          userDetails={userDetails}
          variant={variant}
        />
        <FieldErrorAlert field={"email"} />
      </Grid>
      {variant === "personal" && (
        <>
          <Stack
            alignItems={"center"}
            sx={{ width: "100%", textTransform: "none" }}
          >
            <Button
              variant={"contained"}
              startIcon={<QrCode />}
              onClick={() => setCustomerIdDialogOpen(true)}
            >
              Vis kunde-ID
            </Button>
          </Stack>
          <Dialog
            open={customerIdDialogOpen}
            onClose={() => setCustomerIdDialogOpen(false)}
          >
            <QRCode value={userDetails.id} />
          </Dialog>
        </>
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
