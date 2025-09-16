"use client";

import { Anchor, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense } from "react";

import { publicApiClient } from "@/shared/api/publicApiClient";
import ErrorAlert from "@/shared/ui/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/ui/components/alerts/InfoAlert";
import SuccessAlert from "@/shared/ui/components/alerts/SuccessAlert";
import CountdownToRedirect from "@/shared/ui/components/CountdownToRedirect";

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
        <Anchor component={Link} href={"/user-settings"}>
          Gå til brukerinnstillinger
        </Anchor>
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
