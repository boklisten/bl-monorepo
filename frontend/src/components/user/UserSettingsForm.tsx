"use client";

import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Space, Stack, TextInput, Tooltip } from "@mantine/core";
import {
  IconCheck,
  IconInfoCircleFilled,
  IconMailFast,
} from "@tabler/icons-react";
import { createFieldMap, useStore } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";

import InfoAlert from "@/components/ui/alerts/InfoAlert";
import WarningAlert from "@/components/ui/alerts/WarningAlert";
import UserInfoFields, {
  UserInfoFieldValues,
} from "@/components/user/UserInfoFields";
import { useAppForm } from "@/hooks/form";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

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
    birthday: dayjs(userDetail.dob).format("YYYY-MM-DD"),
    guardianName: userDetail.guardian?.name ?? "",
    guardianEmail: userDetail.guardian?.email ?? "",
    guardianPhoneNumber: userDetail.guardian?.phone ?? "",
    branchMembership: userDetail.branchMembership ?? "",
  };
  const form = useAppForm({
    defaultValues,
    onSubmit: () => updateUserDetailsMutation.mutate(),
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
  const createEmailConfirmation = useMutation({
    mutationFn: () => client.email_validations.$post().unwrap(),
    onError: () =>
      showErrorNotification("Klarte ikke sende ny bekreftelseslenke"),
  });

  const primaryPhoneNumber = useStore(
    form.store,
    (state) => state.values.phoneNumber,
  );

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
      <Space />
      <UserInfoFields
        perspective={"administrate"}
        primaryEmail={userDetail.email}
        primaryPhoneNumber={primaryPhoneNumber}
        fields={createFieldMap(defaultValues)}
        form={form}
      />
      <form.AppForm>
        <form.ErrorSummary serverErrors={serverErrors} />
      </form.AppForm>
      <Space />
      <Button
        loading={updateUserDetailsMutation.isPending}
        onClick={form.handleSubmit}
      >
        Lagre
      </Button>
    </Stack>
  );
}
