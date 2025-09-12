"use client";

import { Anchor, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import CountdownToRedirect from "@/components/CountdownToRedirect";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import InfoAlert from "@/components/ui/alerts/InfoAlert";
import SuccessAlert from "@/components/ui/alerts/SuccessAlert";
import { publicApiClient } from "@/utils/publicApiClient";

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
      <CountdownToRedirect path={"/"} seconds={5} />
    </>
  );
}
