"use client";
import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import { Button, Divider, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useMutation } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import { InferErrorType } from "@tuyau/client";
import moment, { Moment } from "moment";
import { FormProvider, useForm } from "react-hook-form";

import { addAccessToken, addRefreshToken } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import FacebookButton from "@/components/user/FacebookButton";
import ErrorSummary from "@/components/user/fields/ErrorSummary";
import { usePostalCity } from "@/components/user/fields/PostalCodeField";
import GoogleButton from "@/components/user/GoogleButton";
import GuardianInfoSection from "@/components/user/user-detail-editor/GuardianInfoSection";
import LoginInfoSection from "@/components/user/user-detail-editor/LoginInfoSection";
import TermsAndConditionsSection from "@/components/user/user-detail-editor/TermsAndConditionsSection";
import YourInfoSection from "@/components/user/user-detail-editor/YourInfoSection";
import VippsButton from "@/components/user/VippsButton";
import { publicApiClient } from "@/utils/api/publicApiClient";
import useApiClient from "@/utils/api/useApiClient";
import { SUCCESS_NOTIFICATION } from "@/utils/notifications";
import useAuthLinker from "@/utils/useAuthLinker";

export interface UserEditorFields {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  birthday: Moment | null;
  guardianName: string | undefined;
  guardianEmail: string | undefined;
  guardianPhoneNumber: string | undefined;
  branchMembership: string | undefined;
  agreeToTermsAndConditions: boolean;
}

const isUnder18 = (birthday: moment.Moment): boolean => {
  return moment().diff(birthday, "years") < 18;
};

export default function PersonalUserDetailEditor({
  isSignUp,
  userDetails = {} as UserDetail,
}: {
  isSignUp?: boolean;
  userDetails?: UserDetail;
}) {
  const { redirectToCaller } = useAuthLinker();
  const client = useApiClient();
  const notifications = useNotifications();

  const defaultValues = {
    email: userDetails.email,
    name: userDetails.name,
    phoneNumber: userDetails.phone,
    address: userDetails.address,
    postalCode: userDetails.postCode,
    postalCity: userDetails.postCity,
    birthday: userDetails.dob ? moment(userDetails.dob) : null,
    guardianName: userDetails.guardian?.name,
    guardianEmail: userDetails.guardian?.email,
    guardianPhoneNumber: userDetails.guardian?.phone,
    branchMembership: userDetails?.branchMembership,
  };

  const methods = useForm<UserEditorFields>({
    mode: "onTouched",
    defaultValues,
  });
  const { handleSubmit, clearErrors, setError, watch } = methods;

  const { updatePostalCity, settlePostalCity, postalCity } = usePostalCity(
    userDetails.postCity,
    userDetails.postCode,
  );

  function handleSubmitError(
    error: InferErrorType<
      | typeof client.auth.local.register.$post
      | typeof client.v2.user_details.$post
    >,
  ) {
    if (!error) return;
    if (error.status === 422) {
      for (const validationError of error.value.errors) {
        const { field } = validationError;
        // fixme: we should properly handle all types of field errors from the API
        if (field === "email" || field === "phoneNumber") {
          setError(field, {
            message: validationError.message,
          });
        } else {
          setError("email", {
            message: validationError.message,
          });
        }
      }
      return;
    }

    // fixme: unknown errors should not be on the email field
    setError("email", {
      message:
        "Noe gikk galt! Prøv igjen, eller ta kontakt dersom problemet vedvarer!",
    });
  }

  async function registerUser(formData: UserEditorFields, postalCity: string) {
    const { data, error } = await publicApiClient.auth.local.register.$post({
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,

      name: formData.name,
      address: formData.address,
      postalCode: formData.postalCode,
      postalCity: postalCity,
      dob: formData.birthday?.format("YYYY-MM-DD") ?? "",
      branchMembership: formData.branchMembership ?? "",
      guardian: {
        name: formData.guardianName,
        email: formData.guardianEmail,
        phone: formData.guardianPhoneNumber,
      },
    });

    if (error) {
      handleSubmitError(error);
      return;
    }

    addAccessToken(data.accessToken);
    addRefreshToken(data.refreshToken);
    redirectToCaller();
  }

  async function updateUserDetails(
    formData: UserEditorFields,
    postalCity: string,
  ) {
    const { error } = await client.v2.user_details.$post({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      postalCode: formData.postalCode,
      postalCity: postalCity,
      dob: formData.birthday?.format("YYYY-MM-DD") ?? "",
      branchMembership: formData.branchMembership ?? "",
      guardian: {
        name: formData.guardianName,
        email: formData.guardianEmail,
        phone: formData.guardianPhoneNumber,
      },
    });

    if (error) {
      handleSubmitError(error);
      return;
    }

    notifications.show(
      "Brukerinnstillingene ble lagret!",
      SUCCESS_NOTIFICATION,
    );
  }

  const updateDetailsMutation = useMutation({
    mutationFn: async (data: UserEditorFields) => {
      const postalCityStatus = await settlePostalCity;
      switch (postalCityStatus.state) {
        case "error": {
          setError("postalCode", {
            message:
              "Noe gikk galt under sjekk av postnummer! Prøv igjen," +
              " eller ta kontakt dersom problemet vedvarer!",
          });
          return;
        }
        case "invalid": {
          setError("postalCode", { message: "Ugyldig postnummer" });
          return;
        }
      }

      if (isSignUp) {
        await registerUser(data, postalCityStatus.city);
      } else {
        await updateUserDetails(data, postalCityStatus.city);
      }
    },
  });

  const birthdayFieldValue = watch("birthday");

  const onIsUnderageChange = (isUnderage: boolean | null) => {
    if (isUnderage === null || isUnderage) {
      clearErrors("guardianName");
      clearErrors("guardianEmail");
      clearErrors("guardianPhoneNumber");
    }
  };

  const onSubmit = handleSubmit((data) => updateDetailsMutation.mutate(data));
  const isUnderage = birthdayFieldValue ? isUnder18(birthdayFieldValue) : null;

  return (
    <FormProvider {...methods}>
      <Container component="main" maxWidth="xs">
        <Stack alignItems="center" mt={4}>
          <Typography variant="h1" mb={2}>
            {isSignUp ? "Registrer deg" : "Brukerinnstillinger"}
          </Typography>
          {isSignUp && (
            <>
              <Stack gap={2} sx={{ width: "100%", alignItems: "center" }}>
                <VippsButton verb={"register"} />
                <FacebookButton label={"Registrer deg med Facebook"} />
                <GoogleButton label={"Registrer deg med Google"} />
              </Stack>
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
                userDetails={userDetails}
              />
              <YourInfoSection
                postCity={postalCity}
                updatePostalCity={updatePostalCity}
                onIsUnderageChange={onIsUnderageChange}
              />
              {isUnderage && <GuardianInfoSection />}
              {isSignUp && <TermsAndConditionsSection />}
            </Grid>
            <ErrorSummary />
            <Button
              loading={updateDetailsMutation.isPending}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isSignUp ? "Registrer deg" : "Lagre"}
            </Button>
            {isSignUp && (
              <DynamicLink href={"/auth/login"}>
                Har du allerede en konto? Logg inn
              </DynamicLink>
            )}
          </Box>
        </Stack>
      </Container>
    </FormProvider>
  );
}
