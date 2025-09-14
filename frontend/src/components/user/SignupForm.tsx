"use client";

import { Button, Stack } from "@mantine/core";
import { createFieldMap } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { addAccessToken, addRefreshToken } from "@/api/token";
import WarningAlert from "@/components/ui/alerts/WarningAlert";
import UserInfoFields, {
  userInfoFieldDefaultValues,
  UserInfoFieldValues,
} from "@/components/user/UserInfoFields";
import { useAppForm } from "@/hooks/form";
import useAuthLinker from "@/hooks/useAuthLinker";
import { publicApiClient } from "@/utils/publicApiClient";

function isSchoolEmail(email: string) {
  return [
    "osloskolen.no",
    "sonans.no",
    "wangelev.no",
    "edu.nki.no",
    "stud.akademiet.no",
    "elev.ottotreider.no",
  ].some((domain) => email.includes(domain));
}

type SignupFormValues = {
  email: string;
  password: string;
  agreeToTermsAndConditions: boolean;
} & UserInfoFieldValues;

const defaultValues: SignupFormValues = {
  email: "",
  password: "",
  ...userInfoFieldDefaultValues,
  agreeToTermsAndConditions: false,
};

export default function SignupForm() {
  const { redirectToCaller } = useAuthLinker();
  const registerMutation = useMutation({
    mutationFn: (data: SignupFormValues) =>
      publicApiClient.auth.local.register
        .$post({
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,

          name: data.name,
          address: data.address,
          postalCode: data.postalCode,
          postalCity: data.postalCity,
          dob: data.birthday,
          branchMembership: data.branchMembership,
          ...(data.guardian ?? {}),
        })
        .unwrap(),
    onError: () => {
      // TODO: display API errors above the submit button, both specific and generic
    },
    onSuccess: (data) => {
      addAccessToken(data.accessToken);
      addRefreshToken(data.refreshToken);
      redirectToCaller();
    },
  });

  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => registerMutation.mutate(value),
  });

  // TODO: maybe just on sign up: move phone, email and password to the very bottom, this means taking phone out of user info, but is better for later when we want to maybe change phone number or whatever
  return (
    <Stack gap={"xs"}>
      <form.AppField name={"email"}>
        {(field) => <field.EmailField />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.email}>
        {(email) =>
          isSchoolEmail(email) && (
            <WarningAlert>
              Vi anbefaler at du bruker din personlige e-postadresse i stedet
              for skolekontoen. Da beholder du tilgangen etter endt utdanning og
              kan motta viktige varsler om eventuelle manglende
              bokinnleveringer.
            </WarningAlert>
          )
        }
      </form.Subscribe>
      <form.AppField name={"password"}>
        {(field) => <field.NewPasswordField />}
      </form.AppField>
      <UserInfoFields
        perspective={"personal"}
        fields={createFieldMap(defaultValues)}
        form={form}
      />
      <form.AppForm>
        <form.ErrorSummary />
      </form.AppForm>
      <Button
        mt={"md"}
        loading={registerMutation.isPending}
        onClick={form.handleSubmit}
      >
        Registrer deg
      </Button>
    </Stack>
  );
}
