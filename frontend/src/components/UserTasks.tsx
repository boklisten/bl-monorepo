"use client";
import { Send } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Skeleton,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import moment from "moment";

import { getAccessTokenBody } from "@/api/token";
import CountdownToRedirect from "@/components/CountdownToRedirect";
import SignAgreement from "@/components/SignAgreement";
import UserDetailsEditor, {
  isUnder18,
} from "@/components/user/user-detail-editor/UserDetailsEditor";
import useApiClient from "@/hooks/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

export default function UserTasks({
  cachedAgreementText,
}: {
  cachedAgreementText: string;
}) {
  const client = useApiClient();
  const notifications = useNotifications();
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
    return (
      <Stack maxWidth={"md"} width={"100%"}>
        <Skeleton width={"100%"} height={150} />
        <Skeleton width={"100%"} height={150} />
        <Skeleton width={"100%"} height={150} />
      </Stack>
    );
  }
  if (!data || isError) {
    return (
      <Alert severity="error">
        Noe gikk galt under lasting av dine oppgaver. Vennligst prøv igjen eller
        ta kontakt hvis problemet vedvarer
      </Alert>
    );
  }
  const hasTasks =
    (data.tasks?.confirmDetails || data.tasks?.signAgreement) ?? false;

  if (!hasTasks) {
    return (
      <Stack gap={1}>
        <Alert severity={"success"}>
          Du har fullført alle utestående oppgaver
        </Alert>
        <CountdownToRedirect shouldRedirectToCaller={true} seconds={5} />
      </Stack>
    );
  }
  const confirmDetailsTask = data?.tasks?.confirmDetails;
  const signAgreementTask = data?.tasks?.signAgreement;
  return (
    <>
      <Typography
        variant={"subtitle2"}
        sx={{ fontWeight: "light", fontStyle: "italic", mb: 1 }}
      >
        Vi mangler noen opplysninger fra deg – fullfør oppgavene nedenfor for å
        fortsette.
      </Typography>
      <Stepper
        activeStep={confirmDetailsTask === false ? 1 : 0}
        orientation={"vertical"}
        sx={{ maxWidth: "md" }}
      >
        {confirmDetailsTask !== undefined && (
          <Step completed={!confirmDetailsTask}>
            <StepLabel>Bekreft din informasjon</StepLabel>
            <StepContent>
              <Box mt={1} />
              <UserDetailsEditor userDetails={data} variant={"personal"} />
            </StepContent>
          </Step>
        )}
        {signAgreementTask === true && (
          <Step>
            <StepLabel>Signer låneavtale</StepLabel>
            <StepContent>
              <Box mt={1} />
              {isUnder18(moment(data.dob)) ? (
                <Stack gap={2}>
                  <Alert severity={"info"}>
                    <AlertTitle>
                      Send signaturforespørsel til foresatt
                    </AlertTitle>
                    Siden du er under 18 år krever vi signatur fra en av dine
                    foresatte.
                    <Stack gap={1} mt={2}>
                      <Typography variant={"body1"}>
                        Oppgitt foresatt
                      </Typography>
                      <Stack direction={"row"} gap={1}>
                        <Typography variant={"body2"}>Navn</Typography>
                        <Typography variant={"body2"} fontWeight={"bold"}>
                          {data.guardian?.name}
                        </Typography>
                      </Stack>
                      <Stack direction={"row"} gap={1}>
                        <Typography variant={"body2"}>
                          Telefonnummer:
                        </Typography>
                        <Typography variant={"body2"} fontWeight={"bold"}>
                          {data.guardian?.phone}
                        </Typography>
                      </Stack>
                      <Stack direction={"row"} gap={1}>
                        <Typography variant={"body2"}>E-post:</Typography>
                        <Typography variant={"body2"} fontWeight={"bold"}>
                          {data.guardian?.email}
                        </Typography>
                      </Stack>
                      <Typography
                        fontStyle={"italic"}
                        fontSize={"small"}
                        mt={2}
                      >
                        Du kan endre foresatt-opplysninger i brukerinnstillinger
                      </Typography>
                    </Stack>
                  </Alert>
                  <Button
                    startIcon={<Send />}
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
            </StepContent>
          </Step>
        )}
      </Stepper>
    </>
  );
}
