"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { ContentCopy, Send } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";

import SignedContractDetails from "@/components/SignedContractDetails";
import useApiClient from "@/hooks/useApiClient";
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
    return <Alert severity="error">Klarte ikke laste signatur</Alert>;
  }

  if (data.isSignatureValid) {
    return (
      <Stack gap={1} alignItems="center">
        <Typography variant={"h2"}>Signatur</Typography>
        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 1 }}>
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
    <Stack gap={1} alignItems="center">
      <Typography variant={"h2"}>Signatur</Typography>
      <Alert severity={"warning"}>
        <Stack gap={1}>
          <AlertTitle>Denne kunden har ikke gyldig signatur</AlertTitle>
          <Button
            startIcon={<ContentCopy />}
            onClick={async () => {
              const link = `${window.location.origin}/signering/${userDetail.id}`;
              try {
                await navigator.clipboard.writeText(link);
                showSuccessNotification("Signeringslenke ble kopiert!");
              } catch {
                showErrorNotification("Klarte ikke kopiere signeringslenke");
              }
            }}
          >
            Kopier signeringslenke
          </Button>
          <Button
            startIcon={<Send />}
            loading={requestSignatureMutation.isPending}
            onClick={() => requestSignatureMutation.mutate()}
          >
            Send signeringslenke
          </Button>
        </Stack>
      </Alert>
    </Stack>
  );
}
