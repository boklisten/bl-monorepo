"use client";
import {
  Button,
  Group,
  Skeleton,
  Stack,
  Stepper,
  Text,
  Title,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { getAccessTokenBody } from "@/api/token";
import CountdownToRedirect from "@/components/CountdownToRedirect";
import SignAgreement from "@/components/SignAgreement";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import InfoAlert from "@/components/ui/alerts/InfoAlert";
import SuccessAlert from "@/components/ui/alerts/SuccessAlert";
import { isUnder18 } from "@/components/user/UserInfoFields";
import UserSettingsForm from "@/components/user/UserSettingsForm";
import useApiClient from "@/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function UserTasks({
  cachedAgreementText,
}: {
  cachedAgreementText: string;
}) {
  const client = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [client.v2.user_details.$url()],
    queryFn: () => {
      const { details } = getAccessTokenBody();
      if (!details) return null;
      return client.v2.user_details({ detailsId: details }).$get().unwrap();
    },
    refetchInterval: 5000,
  });
  const requestSignatureMutation = useMutation({
    mutationFn: () =>
      client.signatures
        .send({ detailsId: getAccessTokenBody().details })
        .$post()
        .unwrap(),
    onSuccess: () =>
      showSuccessNotification("Signaturforespørsel har blitt sendt!"),
    onError: () =>
      showErrorNotification("Klarte ikke sende signaturforespørsel"),
  });

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height={150} />
        <Skeleton height={150} />
        <Skeleton height={150} />
      </Stack>
    );
  }
  if (!data || isError) {
    return (
      <ErrorAlert title={"Noe gikk galt under lasting av dine oppgaver"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }
  const hasTasks =
    (data.tasks?.confirmDetails || data.tasks?.signAgreement) ?? false;

  if (!hasTasks) {
    return (
      <Stack>
        <SuccessAlert>Du har fullført alle utestående oppgaver</SuccessAlert>
        <Suspense>
          <CountdownToRedirect shouldRedirectToCaller={true} seconds={5} />
        </Suspense>
      </Stack>
    );
  }
  const confirmDetailsTask = data?.tasks?.confirmDetails;
  const signAgreementTask = data?.tasks?.signAgreement;
  return (
    <>
      <Text fs={"italic"}>
        Vi mangler noen opplysninger fra deg – fullfør oppgavene nedenfor for å
        fortsette.
      </Text>
      <Stepper active={confirmDetailsTask === false ? 1 : 0}>
        {confirmDetailsTask !== undefined && (
          <Stepper.Step label={"Bekreft din informasjon"}>
            <UserSettingsForm userDetail={data} />
          </Stepper.Step>
        )}
        {signAgreementTask === true && (
          <Stepper.Step label={"Signer låneavtale"}>
            {isUnder18(data.dob) ? (
              <Stack>
                <InfoAlert title={"Send signaturforespørsel til foresatt"}>
                  <Stack gap={5}>
                    <Text>
                      Siden du er under 18 år krever vi signatur fra en av dine
                      foresatte.
                    </Text>
                    <Title mt={"xs"} order={4}>
                      Oppgitt foresatt
                    </Title>
                    <Group gap={5}>
                      <Text>Navn</Text>
                      <Text fw={"bold"}>{data.guardian?.name}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text>Telefonnummer:</Text>
                      <Text fw={"bold"}>{data.guardian?.phone}</Text>
                    </Group>
                    <Group gap={5}>
                      <Text>E-post:</Text>
                      <Text fw={"bold"}>{data.guardian?.email}</Text>
                    </Group>
                    <Text fs={"italic"} size={"sm"} mt={"xs"}>
                      Du kan endre foresatt-opplysninger i brukerinnstillinger
                    </Text>
                  </Stack>
                </InfoAlert>
                <Button
                  leftSection={<IconSend />}
                  loading={requestSignatureMutation.isPending}
                  onClick={() => requestSignatureMutation.mutate()}
                >
                  Send signeringsforespørsel
                  {data.guardian?.name && ` til ${data.guardian?.name}`}
                </Button>
              </Stack>
            ) : (
              <SignAgreement
                userDetailId={data.id}
                cachedAgreementText={cachedAgreementText}
              />
            )}
          </Stepper.Step>
        )}
      </Stepper>
    </>
  );
}
