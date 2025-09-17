"use client";

import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Space, Stack, TextInput, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconCheck,
  IconInfoCircleFilled,
  IconMailFast,
  IconQrcode,
} from "@tabler/icons-react";
import { createFieldMap } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import QRCode from "react-qr-code";

import UserInfoFields, {
  UserInfoFieldValues,
} from "@/features/user/UserInfoFields";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import WarningAlert from "@/shared/components/alerts/WarningAlert";
import { emailFieldValidator } from "@/shared/components/form/fields/complex/EmailField";
import { nameFieldValidator } from "@/shared/components/form/fields/complex/NameField";
import { phoneNumberFieldValidator } from "@/shared/components/form/fields/complex/PhoneNumberField";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import { isUnder18 } from "@/shared/utils/dates";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function UserSettingsForm({
  userDetail,
}: {
  userDetail: UserDetail;
}) {
  const queryClient = useQueryClient();
  const client = useApiClient();
  const defaultValues: UserInfoFieldValues = {
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
                userDetail.email,
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
      const { error } = await client.v2.user_details.$post({
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
        queryKey: [client.v2.user_details.me.$url()],
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
  const createEmailConfirmation = useMutation({
    mutationFn: () => client.email_validations.$post().unwrap(),
    onError: () =>
      showErrorNotification("Klarte ikke sende ny bekreftelseslenke"),
  });

  return (
    <Stack gap={"xs"}>
      <TextInput
        disabled
        label={"E-post"}
        description={"Ta kontakt dersom du ønsker å endre e-postadresse"}
        value={userDetail.email}
        rightSection={
          <Tooltip
            label={userDetail.emailConfirmed ? "Bekreftet" : "Ikke bekreftet"}
          >
            {userDetail.emailConfirmed ? (
              <IconCheck color={"green"} />
            ) : (
              <IconInfoCircleFilled color={"orange"} />
            )}
          </Tooltip>
        }
      />
      {!userDetail.emailConfirmed && (
        <Stack>
          {createEmailConfirmation.isSuccess ? (
            <InfoAlert icon={<IconMailFast />}>
              Bekreftelseslenke er sendt til din e-postadresse! Sjekk søppelpost
              om den ikke dukker opp i inbox.
            </InfoAlert>
          ) : (
            <>
              <WarningAlert title={"E-postadressen er ikke bekreftet"}>
                En bekreftelseslenke har blitt sendt til {userDetail.email}.
                Trykk på knappen nedenfor for å sende en ny lenke.
              </WarningAlert>
              <Button
                leftSection={<IconMailFast />}
                onClick={() => createEmailConfirmation.mutate()}
              >
                Send bekreftelseslenke på nytt
              </Button>
            </>
          )}
        </Stack>
      )}
      <Stack align={"center"} w={"100%"}>
        <Button
          leftSection={<IconQrcode />}
          onClick={() =>
            modals.open({
              title: `Kunde-ID for ${userDetail.name}`,
              children: (
                <Stack align={"center"}>
                  <QRCode value={userDetail.id} />
                </Stack>
              ),
            })
          }
        >
          Vis kunde-ID
        </Button>
      </Stack>
      <Space />
      <UserInfoFields
        perspective={"personal"}
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
