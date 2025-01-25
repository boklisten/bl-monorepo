import Grid from "@mui/material/Grid";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { FieldErrors, UseFormRegister, UseFormSetError } from "react-hook-form";

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
}

const LoginInfoSection = ({
  errors,
  signUp,
  emailConfirmed,
  userDetails,
  register,
  setError,
}: LoginInfoSectionProps) => (
  <>
    <Grid item xs={12}>
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
    {signUp && (
      <Grid item xs={12}>
        <PasswordField
          autoComplete="new-password"
          error={!!errors.password}
          {...register("password", fieldValidators.password)}
          margin="none"
        />
        <FieldErrorAlert error={errors.password} />
      </Grid>
    )}
  </>
);

export default LoginInfoSection;
