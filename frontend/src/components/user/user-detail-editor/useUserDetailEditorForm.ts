import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import moment, { Moment } from "moment/moment";
import { useRouter, useSearchParams } from "next/navigation";
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

import { getAccessTokenBody } from "@/api/token";
import { registerUser, updateUserDetails } from "@/api/user";
import { executeReturnRedirect } from "@/components/AuthLinker";
import {
  PostalCityState,
  usePostalCity,
} from "@/components/user/fields/PostalCodeField";
import { assertBlApiError } from "@/utils/types";

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
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const onSubmitValid: SubmitHandler<UserEditorFields> = async (data) => {
    setIsSubmitting(true);
    if (isSignUp) {
      try {
        await registerUser(data.email, data.password);
      } catch (error) {
        if (assertBlApiError(error)) {
          if (error.code === 903) {
            setError("email", {
              message:
                "Det finnes allerede en bruker med denne e-postadressen!",
            });
            setIsSubmitting(false);
            return;
          }
          if (error.httpStatus === 500) {
            setError("email", {
              message:
                "Noe gikk galt under registreringen! Prøv igjen, eller ta kontakt dersom problemet vedvarer!",
            });
          }
        }
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
      await updateUserDetails(getAccessTokenBody().details, {
        name: data.name,
        email: data.email,
        phone: data.phoneNumber,
        address: data.address,
        postCode: data.postalCode,
        postCity: postalCityStatus.city,
        dob: data.birthday?.toDate() ?? new Date(),
        guardian: {
          name: data?.guardianName ?? "",
          email: data?.guardianEmail ?? "",
          phone: data?.guardianPhoneNumber ?? "",
        },
      });
    } catch (error) {
      if (assertBlApiError(error)) {
        setError("email", {
          message:
            "Noe gikk galt under registreringen! Prøv igjen, eller ta kontakt dersom problemet vedvarer!",
        });
      }
    }

    if (isSignUp) {
      executeReturnRedirect(searchParams, router);
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

export const isUnder18 = (birthday: moment.Moment): boolean => {
  return moment().diff(birthday, "years") < 18;
};
