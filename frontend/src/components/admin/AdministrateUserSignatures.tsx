"use client";
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
import { useNotifications } from "@toolpad/core";
import Image from "next/image";

import useApiClient from "@/utils/api/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

export default function AdministrateUserSignatures({
  detailsId,
}: {
  detailsId: string;
}) {
  const notifications = useNotifications();
  const client = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [client.signatures.get({ detailsId }).$url(), detailsId],
    queryFn: () => client.signatures.get({ detailsId }).$get().unwrap(),
  });
  const requestSignatureMutation = useMutation({
    mutationFn: () => client.signatures.send({ detailsId }).$post().unwrap(),
    onSuccess: () =>
      notifications.show(
        "Signaturforespørsel har blitt sendt!",
        SUCCESS_NOTIFICATION,
      ),
    onError: () =>
      notifications.show(
        "Klarte ikke sende signaturforespørsel",
        ERROR_NOTIFICATION,
      ),
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
            loading={requestSignatureMutation.isPending}
            onClick={() => requestSignatureMutation.mutate()}
          >
            Send signeringslenke på nytt
          </Button>
        </Stack>
      </Alert>
    </Stack>
  );
}
