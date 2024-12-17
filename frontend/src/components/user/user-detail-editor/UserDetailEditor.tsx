"use client";
import DynamicLink from "@frontend/components/DynamicLink";
import FacebookButton from "@frontend/components/user/FacebookButton";
import ErrorSummary from "@frontend/components/user/fields/ErrorSummary";
import FieldErrorAlert from "@frontend/components/user/fields/FieldErrorAlert";
import GoogleButton from "@frontend/components/user/GoogleButton";
import { fieldValidators } from "@frontend/components/user/user-detail-editor/fieldValidators";
import GuardianInfoSection from "@frontend/components/user/user-detail-editor/GuardianInfoSection";
import LoginInfoSection from "@frontend/components/user/user-detail-editor/LoginInfoSection";
import TermsAndConditionsDisclaimer from "@frontend/components/user/user-detail-editor/TermsAndConditionsDisclaimer";
import { useUserDetailEditorForm } from "@frontend/components/user/user-detail-editor/useUserDetailEditorForm";
import YourInfoSection from "@frontend/components/user/user-detail-editor/YourInfoSection";
import { LoadingButton } from "@mui/lab";
import { Alert, Divider, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import { UserDetail } from "@shared/user/user-detail/user-detail";

const UserDetailEditor = ({
  isSignUp,
  userDetails = {} as UserDetail,
}: {
  isSignUp?: boolean;
  userDetails?: UserDetail;
}) => {
  const {
    isJustSaved,
    setIsJustSaved,
    isSubmitting,
    register,
    control,
    setError,
    errors,
    updatePostalCity,
    postalCity,
    onSubmit,
    isUnderage,
    onIsUnderageChange,
  } = useUserDetailEditorForm(userDetails, isSignUp);

  return (
    <Container component="main" maxWidth="xs">
      <Stack
        sx={{
          alignItems: "center",
          mt: 4,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            mb: 2,
          }}
        >
          {isSignUp ? "Registrer deg" : "Brukerinnstillinger"}
        </Typography>
        {isSignUp && (
          <>
            <FacebookButton label={"Registrer deg med Facebook"} />
            <GoogleButton label={"Registrer deg med Google"} />
            <Divider sx={{ width: "100%", my: 3 }}>
              Eller, registrer deg med e-post
            </Divider>
          </>
        )}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <LoginInfoSection
              signUp={isSignUp}
              emailConfirmed={userDetails.emailConfirmed}
              errors={errors}
              setError={setError}
              userDetails={userDetails}
              register={register}
            />
            <YourInfoSection
              errors={errors}
              postCity={postalCity}
              updatePostalCity={updatePostalCity}
              onIsUnderageChange={onIsUnderageChange}
              control={control}
              register={register}
            />
            {isUnderage && (
              <GuardianInfoSection errors={errors} register={register} />
            )}
            {isSignUp && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      data-testid="tos-field"
                      sx={{
                        color: errors.agreeToTermsAndConditions
                          ? "red"
                          : "inherit",
                      }}
                      {...register(
                        "agreeToTermsAndConditions",
                        fieldValidators.agreeToTermsAndConditions,
                      )}
                    />
                  }
                  label={<TermsAndConditionsDisclaimer />}
                />
                <FieldErrorAlert error={errors.agreeToTermsAndConditions} />
              </Grid>
            )}
          </Grid>
          <ErrorSummary errors={errors} />
          {isJustSaved && (
            <Alert
              sx={{ mt: 2 }}
              onClose={() => setIsJustSaved(false)}
              severity="success"
            >
              Brukerinnstillingene ble oppdatert
            </Alert>
          )}
          <LoadingButton
            loading={isSubmitting}
            data-testid="submit-button"
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isSignUp ? "Registrer deg" : "Lagre"}
          </LoadingButton>
          {isSignUp && (
            <DynamicLink href={"/auth/login"}>
              Har du allerede en konto? Logg inn
            </DynamicLink>
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default UserDetailEditor;
