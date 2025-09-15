"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import {
  Box,
  Button,
  CopyButton,
  Group,
  Skeleton,
  Stack,
  Title,
} from "@mantine/core";
import { IconCopy, IconSend } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";

import SignedContractDetails from "@/components/SignedContractDetails";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import WarningAlert from "@/components/ui/alerts/WarningAlert";
import useApiClient from "@/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function AdministrateUserSignatures({
  userDetail,
}: {
  userDetail: UserDetail;
}) {
  const client = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      client.signatures.get({ detailsId: userDetail.id }).$url(),
      userDetail.id,
    ],
    queryFn: () =>
      client.signatures.get({ detailsId: userDetail.id }).$get().unwrap(),
  });
  const requestSignatureMutation = useMutation({
    mutationFn: () =>
      client.signatures.send({ detailsId: userDetail.id }).$post().unwrap(),
    onSuccess: () =>
      showSuccessNotification("Signaturforespørsel har blitt sendt!"),
    onError: () =>
      showErrorNotification("Klarte ikke sende signaturforespørsel"),
  });
  if (isLoading) {
    return <Skeleton />;
  }
  if (!data || isError) {
    return (
      <ErrorAlert title={"Klarte ikke laste signatur"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  if (data.isSignatureValid) {
    return (
      <Stack align="center">
        <Title order={2}>Signatur</Title>
        <Box style={{ border: "1px solid #ccc", borderRadius: 2, p: 1 }}>
          <Image
            src={`data:image/webp;base64,${data.image}`}
            alt="Kundens signatur"
            width={300}
            height={100}
          />
        </Box>
        <SignedContractDetails
          signedByGuardian={data.signedByGuardian ?? false}
          signingName={data.signingName ?? ""}
          name={userDetail.name}
          signedAtText={data.signedAtText ?? ""}
          expiresAtText={data.expiresAtText ?? ""}
        />
      </Stack>
    );
  }

  return (
    <Stack align="center">
      <Title order={2}>Signatur</Title>
      <WarningAlert title={"Denne kunden har ikke gyldig signatur"}>
        <Group>
          <CopyButton
            value={`${window.location.origin}/signering/${userDetail.id}`}
          >
            {({ copy }) => (
              <Button
                leftSection={<IconCopy />}
                onClick={() => {
                  copy();
                  showSuccessNotification("Signeringslenke ble kopiert!");
                }}
              >
                Kopier signeringslenke
              </Button>
            )}
          </CopyButton>
          <Button
            leftSection={<IconSend />}
            loading={requestSignatureMutation.isPending}
            onClick={() => requestSignatureMutation.mutate()}
          >
            Send signeringslenke
          </Button>
        </Group>
      </WarningAlert>
    </Stack>
  );
}
