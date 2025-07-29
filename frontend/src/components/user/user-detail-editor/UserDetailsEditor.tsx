"use client";

import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useMutation } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import { InferErrorType } from "@tuyau/client";
import moment, { Moment } from "moment";
import { FormProvider, useForm } from "react-hook-form";

import { addAccessToken, addRefreshToken } from "@/api/token";
import DynamicLink from "@/components/DynamicLink";
import ErrorSummary from "@/components/user/fields/ErrorSummary";
import GuardianInfoSection from "@/components/user/user-detail-editor/GuardianInfoSection";
import LoginInfoSection from "@/components/user/user-detail-editor/LoginInfoSection";
import TermsAndConditionsSection from "@/components/user/user-detail-editor/TermsAndConditionsSection";
import YourInfoSection from "@/components/user/user-detail-editor/YourInfoSection";
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
  postalCity: string;
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

export default function UserDetailsEditor({
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

  async function registerUser(formData: UserEditorFields) {
    const { data, error } = await publicApiClient.auth.local.register.$post({
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,

      name: formData.name,
      address: formData.address,
      postalCode: formData.postalCode,
      postalCity: formData.postalCity,
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
    if (!data) {
      setError("email", {
        message:
          "Noe gikk galt! Prøv igjen, eller ta kontakt dersom problemet vedvarer!",
      });
      return;
    }

    addAccessToken(data.accessToken);
    addRefreshToken(data.refreshToken);
    redirectToCaller();
  }

  async function updateUserDetails(formData: UserEditorFields) {
    const { error } = await client.v2.user_details.$post({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      postalCode: formData.postalCode,
      postalCity: formData.postalCity,
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

  const userDetailsMutation = useMutation({
    mutationFn: async (data: UserEditorFields) => {
      if (isSignUp) {
        await registerUser(data);
      } else {
        await updateUserDetails(data);
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

  const isUnderage = birthdayFieldValue ? isUnder18(birthdayFieldValue) : null;

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => {
          userDetailsMutation.mutate(data);
        })}
      >
        <Grid container spacing={2}>
          <LoginInfoSection
            signUp={isSignUp}
            emailConfirmed={userDetails.emailConfirmed}
            userDetails={userDetails}
          />
          <YourInfoSection onIsUnderageChange={onIsUnderageChange} />
          {isUnderage && <GuardianInfoSection />}
          {isSignUp && <TermsAndConditionsSection />}
        </Grid>
        <ErrorSummary />
        <Button
          loading={userDetailsMutation.isPending}
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
    </FormProvider>
  );
}
