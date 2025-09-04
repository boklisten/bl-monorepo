"use client";

import { Alert, Anchor, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import CountdownToRedirect from "@/components/CountdownToRedirect";
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
      <Alert
        icon={<Loader size={"xs"} />}
        variant={"light"}
        title={"Bekrefter e-post..."}
      >
        Vennligst vent mens vi bekrefter din e-post
      </Alert>
    );
  }

  if (isError || !data?.confirmed) {
    return (
      <>
        <Alert color={"red"} title={"Klarte ikke bekrefte e-post"}>
          Lenken kan være utløpt. Du kan prøve å sende en ny lenke fra
          brukerinnstillinger.
        </Alert>
        <Anchor component={Link} href={"/user-settings"}>
          Gå til brukerinnstillinger
        </Anchor>
      </>
    );
  }

  return (
    <>
      <Alert color={"green"} title={"E-postadressen ble bekreftet!"} />
      <CountdownToRedirect path={"/"} seconds={5} />
    </>
  );
}
