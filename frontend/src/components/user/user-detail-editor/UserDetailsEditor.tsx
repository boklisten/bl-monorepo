"use client";

import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Anchor, Button, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferErrorType } from "@tuyau/client";
import moment, { Moment } from "moment";
import Link from "next/link";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { addAccessToken, addRefreshToken } from "@/api/token";
import GuardianInfoSection from "@/components/user/user-detail-editor/GuardianInfoSection";
import LoginInfoSection from "@/components/user/user-detail-editor/LoginInfoSection";
import TermsAndConditionsSection from "@/components/user/user-detail-editor/TermsAndConditionsSection";
import YourInfoSection from "@/components/user/user-detail-editor/YourInfoSection";
import useApiClient from "@/hooks/useApiClient";
import useAuthLinker from "@/hooks/useAuthLinker";
import { GENERIC_ERROR_TEXT, PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import { showSuccessNotification } from "@/utils/notifications";
import { publicApiClient } from "@/utils/publicApiClient";

export interface UserEditorFields {
  email: string;
  emailVerified: boolean | undefined;
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

export const isUnder18 = (birthday: moment.Moment): boolean => {
  return moment().diff(birthday, "years") < 18;
};

export type UserDetailsEditorVariant = "signup" | "personal" | "administrate";

export default function UserDetailsEditor({
  variant,
  userDetails = {} as UserDetail,
}: {
  variant: UserDetailsEditorVariant;
  userDetails?: UserDetail;
}) {
  const queryClient = useQueryClient();
  const { redirectToCaller } = useAuthLinker();
  const client = useApiClient();

  const defaultValues = {
    email: userDetails.email,
    emailVerified: userDetails.emailConfirmed,
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
  const { handleSubmit, clearErrors, setError, control } = methods;

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
        // fixme: we should properly handle all enums of field errors from the API
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
      message: `${GENERIC_ERROR_TEXT} ${PLEASE_TRY_AGAIN_TEXT}`,
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
      branchMembership: formData.branchMembership,
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
        message: `${GENERIC_ERROR_TEXT} ${PLEASE_TRY_AGAIN_TEXT}`,
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
      branchMembership: formData.branchMembership,
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

    showSuccessNotification("Brukerinnstillingene ble lagret!");
  }

  async function updateUserDetailsAsEmployee(formData: UserEditorFields) {
    const { error } = await client.v2.employee
      .user_details({ detailsId: userDetails.id })
      .$post({
        email: formData.email,
        emailVerified: formData.emailVerified ?? false,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        postalCode: formData.postalCode,
        postalCity: formData.postalCity,
        dob: formData.birthday?.format("YYYY-MM-DD") ?? "",
        branchMembership: formData.branchMembership,
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

    showSuccessNotification("Brukerinnstillingene ble lagret!");
  }

  const userDetailsMutation = useMutation({
    mutationFn: async (data: UserEditorFields) => {
      if (variant === "signup") {
        await registerUser(data);
      }
      if (variant === "personal") {
        await updateUserDetails(data);
      }
      if (variant === "administrate") {
        await updateUserDetailsAsEmployee(data);
      }
      await queryClient.invalidateQueries({
        queryKey: ["userDetails", userDetails?.id],
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.v2.user_details.$url()],
      }),
  });

  const isUnderage = useWatch({
    control,
    name: "birthday",
    compute: (value) => (value ? isUnder18(value) : false),
  });

  useEffect(() => {
    if (!isUnderage) {
      clearErrors(["guardianName", "guardianEmail", "guardianPhoneNumber"]);
    }
  }, [isUnderage, clearErrors]);

  // fixme: add error summary when switched out with TanStack Form
  return (
    <FormProvider {...methods}>
      <Stack>
        <LoginInfoSection variant={variant} userDetails={userDetails} />
        <YourInfoSection variant={variant} />
        {isUnderage && <GuardianInfoSection variant={variant} />}
        {variant === "signup" && <TermsAndConditionsSection />}
        <Button
          loading={userDetailsMutation.isPending}
          onClick={handleSubmit((data) => {
            userDetailsMutation.mutate(data);
          })}
        >
          {variant === "signup" ? "Registrer deg" : "Lagre"}
        </Button>
        {variant === "signup" && (
          <Anchor size={"sm"} component={Link} href={"/auth/login"}>
            Har du allerede en konto? Logg inn
          </Anchor>
        )}
      </Stack>
    </FormProvider>
  );
}
