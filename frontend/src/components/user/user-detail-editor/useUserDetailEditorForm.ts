import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import { useMutation } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import { InferErrorType } from "@tuyau/client";
import moment, { Moment } from "moment/moment";
import { useForm } from "react-hook-form";

import { addAccessToken, addRefreshToken } from "@/api/token";
import { usePostalCity } from "@/components/user/fields/PostalCodeField";
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

export function useUserDetailEditorForm(
  userDetails: UserDetail,
  isSignUp?: boolean,
) {
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

  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    setError,
    watch,
    formState: { errors },
  } = useForm<UserEditorFields>({ mode: "onTouched", defaultValues });

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

  return {
    isSubmitting: updateDetailsMutation.isPending,
    register,
    control,
    setError,
    errors,
    updatePostalCity,
    postalCity,
    onSubmit,
    isUnderage,
    onIsUnderageChange,
  };
}

const isUnder18 = (birthday: moment.Moment): boolean => {
  return moment().diff(birthday, "years") < 18;
};
