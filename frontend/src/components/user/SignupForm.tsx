"use client";

import { Anchor, Button, Group, Space, Stack, Text } from "@mantine/core";
import { createFieldMap, useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { addAccessToken, addRefreshToken } from "@/api/token";
import { emailFieldValidator } from "@/components/form/fields/EmailField";
import { newPasswordFieldValidator } from "@/components/form/fields/NewPasswordField";
import WarningAlert from "@/components/ui/alerts/WarningAlert";
import UserInfoFields, {
  userInfoFieldDefaultValues,
  UserInfoFieldValues,
} from "@/components/user/UserInfoFields";
import { useAppForm } from "@/hooks/form";
import useAuthLinker from "@/hooks/useAuthLinker";
import { showErrorNotification } from "@/utils/notifications";
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
  const form = useAppForm({
    defaultValues,
    onSubmit: () => registerMutation.mutate(),
  });
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const formValues = form.state.values;
      const { data, error } = await publicApiClient.auth.local.register.$post({
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        password: formValues.password,

        name: formValues.name,
        address: formValues.address,
        postalCode: formValues.postal.code,
        postalCity: formValues.postal.city,
        dob: formValues.birthday,
        branchMembership: formValues.branchMembership,
        guardian: {
          name: formValues.guardianName,
          email: formValues.guardianEmail,
          phone: formValues.guardianPhoneNumber,
        },
      });

      if (error) {
        if (error.status === 422) {
          setServerErrors(error.value.errors.map((err) => err.message));
          return;
        }
        showErrorNotification("Noe gikk galt under registreringen!");
      }

      setServerErrors([]);
      if (data) {
        addAccessToken(data.accessToken);
        addRefreshToken(data.refreshToken);
        redirectToCaller();
      }
    },
  });
  const primaryEmail = useStore(form.store, (state) => state.values.email);
  const primaryPhoneNumber = useStore(
    form.store,
    (state) => state.values.phoneNumber,
  );

  return (
    <Stack gap={"xs"}>
      <form.AppField
        name={"email"}
        validators={{
          onBlur: ({ value }) => emailFieldValidator(value, "personal"),
        }}
      >
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
      <form.AppField
        name={"password"}
        validators={{
          onBlur: ({ value }) => newPasswordFieldValidator(value),
        }}
      >
        {(field) => <field.NewPasswordField />}
      </form.AppField>
      <UserInfoFields
        perspective={"personal"}
        primaryEmail={primaryEmail}
        primaryPhoneNumber={primaryPhoneNumber}
        fields={createFieldMap(defaultValues)}
        form={form}
      />
      <Space />
      <form.AppField
        name={"agreeToTermsAndConditions"}
        validators={{
          onChange: ({ value }) =>
            !value ? "Du må godta våre betingelser og vilkår" : "",
        }}
      >
        {(field) => (
          <field.CheckboxField
            required
            label={
              <Group gap={3}>
                <Text size={"sm"}>
                  {"Jeg godtar Boklistens "}
                  <Anchor
                    component={Link}
                    href={"/info/policies/conditions"}
                    target={"_blank"}
                  >
                    betingelser
                  </Anchor>
                  {" og "}
                  <Anchor
                    component={Link}
                    href={"/info/policies/terms"}
                    target={"_blank"}
                  >
                    vilkår
                  </Anchor>
                </Text>
                <Text size={"sm"} c={"#fa5252"}>
                  *
                </Text>
              </Group>
            }
          />
        )}
      </form.AppField>
      <Space />
      <form.AppForm>
        <form.ErrorSummary serverErrors={serverErrors} />
      </form.AppForm>
      <Button loading={registerMutation.isPending} onClick={form.handleSubmit}>
        Registrer deg
      </Button>
    </Stack>
  );
}
