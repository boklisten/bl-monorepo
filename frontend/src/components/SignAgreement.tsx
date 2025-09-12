"use client";
import { Button, Skeleton, Stack, Text } from "@mantine/core";
import { TextField } from "@mui/material";
import { IconChecks } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import ExpandableEditableTextReadOnly from "@/components/info/editable-text/ExpandableEditableTextReadOnly";
import SignaturePad from "@/components/SignaturePad";
import SignedContractDetails from "@/components/SignedContractDetails";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import { showErrorNotification } from "@/utils/notifications";
import { publicApiClient } from "@/utils/publicApiClient";

interface SignaturePayload {
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
    queryFn: async () => {
      const signatureStatus = await publicApiClient.signatures
        .valid({ detailsId: userDetailId })
        .$get()
        .unwrap();
      if (!signatureStatus.isUnderage && "name" in signatureStatus)
        setValue("signingName", signatureStatus.name);
      return signatureStatus;
    },
  });

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignaturePayload>({
    defaultValues: { signingName: "", base64EncodedImage: "" },
  });
  const signMutation = useMutation({
    mutationFn: (payload: SignaturePayload) =>
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
  const hasValidResponse = !isError && !isLoading && !!data;
  return (
    <Stack>
      <ExpandableEditableTextReadOnly
        dataKey={"betingelser"}
        cachedText={cachedAgreementText}
      />
      {!isLoading && (isError || !data) && (
        <ErrorAlert title={"Noe gikk galt under lasting av signaturstatus"}>
          {PLEASE_TRY_AGAIN_TEXT}
        </ErrorAlert>
      )}
      {isLoading && (
        <>
          <Skeleton height={40} width={"100%"} />
          <Skeleton height={200} width={"100%"} />
          <Skeleton height={50} width={"100%"} />
          <Skeleton height={50} width={100} />
        </>
      )}
      {hasValidResponse && "message" in data && (
        <ErrorAlert>{data.message}</ErrorAlert>
      )}
      {hasValidResponse &&
        !("message" in data) &&
        data.isSignatureValid == false && (
          <Stack gap={"xs"}>
            <Text>
              Signer her på at du er {data.isUnderage && "foresatt til "}
              {data.name} og godkjenner betingelsene
              {data.isUnderage && " på hans eller hennes vegne"}:
            </Text>
            <Controller
              rules={{
                required: `Du må fylle inn ${data.isUnderage ? "foresatt sin" : "din"} signatur`,
              }}
              name={"base64EncodedImage"}
              control={control}
              render={({ field }) => <SignaturePad onChange={field.onChange} />}
            />
            {errors.base64EncodedImage && (
              <ErrorAlert>{errors.base64EncodedImage.message}</ErrorAlert>
            )}
            <TextField
              required
              sx={{ mt: 1 }}
              label={`Fullt navn ${data.isUnderage ? "(foresatt)" : ""}`}
              slotProps={{
                input: { readOnly: !data.isUnderage },
              }}
              helperText={
                data.isUnderage
                  ? ""
                  : "Du kan endre navnet ditt i brukerinnstillinger"
              }
              {...register("signingName", {
                required: "Du må fylle inn foresatt sitt fulle navn",
                validate: (value) => {
                  if (data.isUnderage && data.name === value) {
                    return "Foresattes navn må være forskjellig fra elevens navn";
                  }
                  return true;
                },
              })}
            />
            {errors.signingName && (
              <ErrorAlert>{errors.signingName.message}</ErrorAlert>
            )}
            <Button
              onClick={handleSubmit((data) => signMutation.mutate(data))}
              loading={signMutation.isPending}
              leftSection={<IconChecks />}
              color={"green"}
            >
              Signer
            </Button>
          </Stack>
        )}
      {hasValidResponse && data.isSignatureValid && (
        <SignedContractDetails
          signedByGuardian={data.signedByGuardian ?? false}
          signingName={data.signingName ?? ""}
          name={data.name ?? ""}
          signedAtText={data.signedAtText ?? ""}
          expiresAtText={data.expiresAtText ?? ""}
        />
      )}
    </Stack>
  );
}
