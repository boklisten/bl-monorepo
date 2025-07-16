import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import moment, { Moment } from "moment/moment";
import { useEffect, useState } from "react";
import {
  Control,
  FieldErrors,
  SubmitHandler,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetError,
} from "react-hook-form";

import {
  addAccessToken,
  addRefreshToken,
  getAccessTokenBody,
} from "@/api/token";
import {
  PostalCityState,
  usePostalCity,
} from "@/components/user/fields/PostalCodeField";
import { publicApiClient } from "@/utils/api/publicApiClient";
import useApiClient from "@/utils/api/useApiClient";
import useAuthLinker from "@/utils/useAuthLinker";

export interface UserEditorFields {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  signUpPhoneNumber: string | undefined; // unused, only for validator
  address: string;
  postalCode: string;
  birthday: Moment | null;
  guardianName: string | undefined;
  guardianEmail: string | undefined;
  guardianPhoneNumber: string | undefined;
  branchMembership: string | undefined;
  agreeToTermsAndConditions: boolean;
}

interface UseUserDetailEditorFormReturn {
  isJustSaved: boolean;
  setIsJustSaved: (isJustSaved: boolean) => void;
  isSubmitting: boolean;
  register: UseFormRegister<UserEditorFields>;
  onSubmit: ReturnType<UseFormHandleSubmit<UserEditorFields>>;
  control: Control<UserEditorFields>;
  setError: UseFormSetError<UserEditorFields>;
  errors: FieldErrors<UserEditorFields>;
  updatePostalCity: (newPostalCode: string) => void;
  postalCity: PostalCityState;
  isUnderage: boolean | null;
  onIsUnderageChange: (isUnderage: boolean | null) => void;
}

export function useUserDetailEditorForm(
  userDetails: UserDetail,
  isSignUp?: boolean,
): UseUserDetailEditorFormReturn {
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { redirectToCaller } = useAuthLinker();
  const client = useApiClient();

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
    formState: { errors, isDirty, submitCount },
    reset,
    getValues,
  } = useForm<UserEditorFields>({ mode: "onTouched", defaultValues });

  const { updatePostalCity, settlePostalCity, postalCity } = usePostalCity(
    userDetails.postCity,
    userDetails.postCode,
  );

  const UNKNOWN_ERROR_TEXT =
    "Noe gikk galt under registreringen! Prøv igjen, eller ta kontakt dersom problemet vedvarer!";
  async function registerUser(user: { email: string; password: string }) {
    const { data, error } =
      await publicApiClient.auth.local.register.$post(user);

    if (error) {
      if (error.status === 422) {
        const emailUniqueError = error.value.errors.find(
          (e) => e.rule === "unique_email",
        );
        if (emailUniqueError !== undefined) {
          setError("email", {
            message: emailUniqueError.message,
          });
          return { success: false };
        }
      }

      // fixme: unknown errors should not be on the email field
      setError("email", {
        message: UNKNOWN_ERROR_TEXT,
      });
      return { success: false };
    }

    addAccessToken(data.accessToken);
    addRefreshToken(data.refreshToken);
    return { success: true };
  }

  const onSubmitValid: SubmitHandler<UserEditorFields> = async (data) => {
    setIsSubmitting(true);
    if (isSignUp) {
      const { success } = await registerUser({
        email: data.email,
        password: data.password,
      });
      if (!success) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
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
      await client
        .$route("collection.userdetails.patch", {
          id: getAccessTokenBody().details,
        })
        .$patch({
          name: data.name,
          email: data.email,
          phone: data.phoneNumber,
          address: data.address,
          postCode: data.postalCode,
          postCity: postalCityStatus.city,
          dob: data.birthday?.toString(),
          branchMembership: data.branchMembership,
          guardian: {
            name: data?.guardianName,
            email: data?.guardianEmail,
            phone: data?.guardianPhoneNumber,
          },
        });
    } catch {
      setError("email", {
        message: UNKNOWN_ERROR_TEXT,
      });
    }

    if (isSignUp) {
      redirectToCaller();
    } else {
      setIsJustSaved(true);
    }

    setIsSubmitting(false);
  };

  // Hide the "Just saved"-banner when the form is dirtied again, and clean on submit
  const values = getValues();
  useEffect(() => {
    if (submitCount > 0 && isJustSaved) {
      reset(values, {
        keepValues: true,
        keepErrors: true,
        keepIsValid: true,
        keepIsValidating: true,
      });
    } else if (isDirty) {
      setIsJustSaved(false);
    }
  }, [isDirty, reset, submitCount, isJustSaved, values]);

  const birthdayFieldValue = watch("birthday");

  const onIsUnderageChange = (isUnderage: boolean | null) => {
    if (isUnderage === null || isUnderage) {
      clearErrors("guardianName");
      clearErrors("guardianEmail");
      clearErrors("guardianPhoneNumber");
    }
  };

  const onSubmit = handleSubmit(onSubmitValid);
  const isUnderage = birthdayFieldValue ? isUnder18(birthdayFieldValue) : null;

  return {
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
  };
}

const isUnder18 = (birthday: moment.Moment): boolean => {
  return moment().diff(birthday, "years") < 18;
};
