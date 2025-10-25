"use client";

import { Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import SuccessAlert from "@/shared/components/alerts/SuccessAlert";
import CountdownToRedirect from "@/shared/components/CountdownToRedirect";
import NextAnchor from "@/shared/components/NextAnchor";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export default function EmailConfirmer({
  confirmationId,
}: {
  confirmationId: string;
}) {
  const { data, isPending, isError } = useQuery({
    queryKey: [
      publicApiClient.email_validations({ id: confirmationId }).$url(),
      confirmationId,
    ],
    queryFn: () =>
      publicApiClient.email_validations({ id: confirmationId }).$get().unwrap(),
  });

  if (isPending) {
    return (
      <InfoAlert
        icon={<Loader size={"xs"} />}
        variant={"light"}
        title={"Bekrefter e-post..."}
      >
        Vennligst vent mens vi bekrefter din e-post
      </InfoAlert>
    );
  }

  if (isError || !data?.confirmed) {
    return (
      <>
        <ErrorAlert title={"Klarte ikke bekrefte e-post"}>
          Lenken kan være utløpt. Du kan prøve å sende en ny lenke fra
          brukerinnstillinger.
        </ErrorAlert>
        <NextAnchor href={"/user-settings"}>
          Gå til brukerinnstillinger
        </NextAnchor>
      </>
    );
  }

  return (
    <>
      <SuccessAlert title={"E-postadressen ble bekreftet!"} />
      <Suspense>
        <CountdownToRedirect path={"/"} seconds={5} />
      </Suspense>
    </>
  );
}
