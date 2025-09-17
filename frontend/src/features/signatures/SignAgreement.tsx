"use client";
import { Button, Skeleton, Spoiler, Stack } from "@mantine/core";
import { IconChecks } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import SignedContractDetails from "@/features/signatures/SignedContractDetails";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import EditableTextReadOnly from "@/shared/components/EditableTextReadOnly";
import { useAppForm } from "@/shared/hooks/form";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import { showErrorNotification } from "@/shared/utils/notifications";
import { publicApiClient } from "@/shared/utils/publicApiClient";

interface SignatureForm {
  signingName: string;
  base64EncodedImage: string;
}

export default function SignAgreement({
  userDetailId,
  cachedAgreementText,
}: {
  userDetailId: string;
  cachedAgreementText: string;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      publicApiClient.signatures.valid({ detailsId: userDetailId }).$url(),
      userDetailId,
    ],
    queryFn: () =>
      publicApiClient.signatures
        .valid({ detailsId: userDetailId })
        .$get()
        .unwrap(),
  });
  const signMutation = useMutation({
    mutationFn: (payload: SignatureForm) =>
      publicApiClient.signatures
        .sign({ detailsId: userDetailId })
        .$post(payload)
        .unwrap(),
    onError: () => showErrorNotification("Noe gikk galt under signering"),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: [
          publicApiClient.signatures.valid({ detailsId: userDetailId }).$url(),
          userDetailId,
        ],
      });
      void queryClient.invalidateQueries({
        queryKey: [publicApiClient.v2.user_details.$url()],
      });
    },
  });
  const form = useAppForm({
    defaultValues: {
      signingName: data && !data.isUnderage && "name" in data ? data.name : "",
      base64EncodedImage: "",
    },
    onSubmit: ({ value }) => signMutation.mutate(value),
  });

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height={40} width={"100%"} />
        <Skeleton height={200} width={"100%"} />
        <Skeleton height={50} width={"100%"} />
        <Skeleton height={50} width={100} />
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <ErrorAlert title={"Noe gikk galt under lasting av signaturstatus"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  if (data.isSignatureValid) {
    return (
      <Stack>
        <Spoiler maxHeight={165} showLabel={"Vis mer"} hideLabel={"Vis mindre"}>
          <EditableTextReadOnly
            dataKey={"betingelser"}
            cachedText={cachedAgreementText}
          />
        </Spoiler>
        <SignedContractDetails
          signedByGuardian={data.signedByGuardian ?? false}
          signingName={data.signingName ?? ""}
          name={data.name ?? ""}
          signedAtText={data.signedAtText ?? ""}
          expiresAtText={data.expiresAtText ?? ""}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      <Spoiler maxHeight={165} showLabel={"Vis mer"} hideLabel={"Vis mindre"}>
        <EditableTextReadOnly
          dataKey={"betingelser"}
          cachedText={cachedAgreementText}
        />
      </Spoiler>
      <Stack gap={"xs"}>
        <form.AppField
          name={"base64EncodedImage"}
          validators={{
            onSubmit: ({ value }) =>
              value.length === 0
                ? `Du må fylle inn ${data.isUnderage ? "foresatt sin" : "din"} signatur`
                : null,
          }}
        >
          {(field) => (
            <field.SignatureCanvasField
              label={`Signer her på at du er${data.isUnderage ? " foresatt til" : ""} ${data.name} og godkjenner betingelsene${data.isUnderage ? " på hans eller hennes vegne" : ""}:`}
            />
          )}
        </form.AppField>
        <form.AppField
          name={"signingName"}
          validators={{
            onChange: ({ value }) => {
              if (value.length === 0)
                return "Du må fylle inn foresatt sitt fulle navn";
              if (data.isUnderage && data.name === value)
                return "Foresattes navn må være forskjellig fra elevens navn";
              return null;
            },
          }}
        >
          {(field) => (
            <field.TextField
              required
              label={`Fullt navn ${data.isUnderage ? "(foresatt)" : ""}`}
              description={
                data.isUnderage
                  ? ""
                  : "Du kan endre navnet ditt i brukerinnstillinger"
              }
              readOnly={!data.isUnderage}
            />
          )}
        </form.AppField>
        <Button
          onClick={form.handleSubmit}
          loading={signMutation.isPending}
          leftSection={<IconChecks />}
          color={"green"}
        >
          Signer
        </Button>
      </Stack>
    </Stack>
  );
}
