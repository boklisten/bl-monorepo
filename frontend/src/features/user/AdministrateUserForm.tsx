"use client";

import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Space, Stack, Tooltip } from "@mantine/core";
import { IconCheck, IconInfoCircleFilled } from "@tabler/icons-react";
import { createFieldMap } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";

import UserInfoFields, {
  isUnder18,
  UserInfoFieldValues,
} from "@/features/user/UserInfoFields";
import { emailFieldValidator } from "@/shared/components/form/fields/complex/EmailField";
import { nameFieldValidator } from "@/shared/components/form/fields/complex/NameField";
import { phoneNumberFieldValidator } from "@/shared/components/form/fields/complex/PhoneNumberField";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

type AdministrateUserFormValues = {
  email: string;
  emailVerified: boolean;
} & UserInfoFieldValues;

export default function AdministrateUserForm({
  userDetail,
}: {
  userDetail: UserDetail;
}) {
  const queryClient = useQueryClient();
  const client = useApiClient();
  const defaultValues: AdministrateUserFormValues = {
    email: userDetail.email,
    emailVerified: userDetail.emailConfirmed ?? false,
    name: userDetail.name,
    phoneNumber: userDetail.phone,
    address: userDetail.address,
    postal: {
      code: userDetail.postCode,
      city: userDetail.postCity,
    },
    birthday: userDetail.dob ? dayjs(userDetail.dob).format("YYYY-MM-DD") : "",
    guardianName: userDetail.guardian?.name ?? "",
    guardianEmail: userDetail.guardian?.email ?? "",
    guardianPhoneNumber: userDetail.guardian?.phone ?? "",
    branchMembership: userDetail.branchMembership ?? "",
  };
  const form = useAppForm({
    defaultValues,
    onSubmit: () => updateUserDetailsMutation.mutate(),
    validators: {
      onSubmit: ({ value }) => {
        if (isUnder18(new Date(value.birthday))) {
          return {
            fields: {
              guardianName: nameFieldValidator(value.guardianName, "guardian"),
              guardianEmail: emailFieldValidator(
                value.guardianEmail,
                "guardian",
                value.email,
              ),
              guardianPhoneNumber: phoneNumberFieldValidator(
                value.guardianPhoneNumber,
                "guardian",
                value.phoneNumber,
              ),
            },
          };
        }
        return null;
      },
    },
  });
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const updateUserDetailsMutation = useMutation({
    mutationFn: async () => {
      const formValues = form.state.values;
      const { error } = await client.v2.employee
        .user_details({ detailsId: userDetail.id })
        .$post({
          email: formValues.email,
          emailVerified: formValues.emailVerified,
          name: formValues.name,
          phoneNumber: formValues.phoneNumber,
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

      await queryClient.invalidateQueries({
        queryKey: ["userDetails", userDetail.id],
      });

      if (error) {
        if (error.status === 422) {
          setServerErrors(error.value.errors.map((err) => err.message));
          return;
        }
        showErrorNotification("Noe gikk galt under registreringen!");
      } else {
        showSuccessNotification("Brukerdetaljene ble oppdatert!");
        setServerErrors([]);
      }
    },
  });

  return (
    <Stack gap={"xs"}>
      <form.Subscribe selector={(state) => state.values.emailVerified}>
        {(emailVerified) => (
          <form.AppField
            name={"email"}
            validators={{
              onBlur: ({ value }) => emailFieldValidator(value, "personal"),
            }}
          >
            {(field) => (
              <field.EmailField
                rightSection={
                  <Tooltip
                    label={emailVerified ? "Bekreftet" : "Ikke bekreftet"}
                  >
                    {emailVerified ? (
                      <IconCheck color={"green"} />
                    ) : (
                      <IconInfoCircleFilled color={"orange"} />
                    )}
                  </Tooltip>
                }
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>
      <form.AppField name={"emailVerified"}>
        {(field) => <field.SwitchField label={"E-post bekreftet"} />}
      </form.AppField>
      <Space />
      <UserInfoFields
        perspective={"administrate"}
        fields={createFieldMap(defaultValues)}
        form={form}
      />
      <form.AppForm>
        <form.ErrorSummary serverErrors={serverErrors} />
      </form.AppForm>
      <Space />
      <Button
        loading={form.state.isValidating || updateUserDetailsMutation.isPending}
        onClick={form.handleSubmit}
      >
        Lagre
      </Button>
    </Stack>
  );
}
