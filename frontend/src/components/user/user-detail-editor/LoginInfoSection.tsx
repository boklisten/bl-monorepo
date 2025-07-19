import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import { QrCode } from "@mui/icons-material";
import { Button, Dialog, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetError,
  UseFormWatch,
} from "react-hook-form";
import PasswordStrengthBar from "react-password-strength-bar";
import QRCode from "react-qr-code";

import EmailConfirmationStatus from "@/components/user/fields/EmailConfirmationStatus";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import MaybeConfirmedEmailField from "@/components/user/fields/MaybeConfirmedEmailField";
import PasswordField from "@/components/user/fields/PasswordField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/useUserDetailEditorForm";

interface LoginInfoSectionProps {
  signUp: boolean | undefined;
  emailConfirmed: boolean | undefined;
  errors: FieldErrors<UserEditorFields>;
  userDetails: UserDetail;
  register: UseFormRegister<UserEditorFields>;
  setError: UseFormSetError<UserEditorFields>;
  watch: UseFormWatch<UserEditorFields>;
}

const LoginInfoSection = ({
  errors,
  signUp,
  emailConfirmed,
  userDetails,
  register,
  setError,
  watch,
}: LoginInfoSectionProps) => {
  const [customerIdDialogOpen, setCustomerIdDialogOpen] = useState(false);
  const passwordValue = watch("password");
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <MaybeConfirmedEmailField
          isSignUp={signUp}
          isEmailConfirmed={emailConfirmed}
          error={!!errors.email}
          {...register("email", fieldValidators.email)}
        />
        <EmailConfirmationStatus
          onError={(message) => setError("email", { message })}
          userDetails={userDetails}
          isSignUp={signUp}
        />
        <FieldErrorAlert error={errors.email} />
      </Grid>
      {!signUp && (
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
      {signUp && (
        <Grid size={{ xs: 12 }}>
          <PasswordField
            autoComplete="new-password"
            error={!!errors.password}
            {...register("password", fieldValidators.password)}
            margin="none"
          />
          <PasswordStrengthBar
            password={passwordValue}
            minLength={10}
            shortScoreWord={"for kort"}
            scoreWords={["svakt", "svakt", "ok", "stekt", "veldig sterkt"]}
          />
          <FieldErrorAlert error={errors.password} />
        </Grid>
      )}
    </>
  );
};

export default LoginInfoSection;
