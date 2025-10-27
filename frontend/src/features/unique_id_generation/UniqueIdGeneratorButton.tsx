"use client";
import { Button } from "@mantine/core";
import { IconFileDownload } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import useApiClient from "@/shared/hooks/useApiClient";
import { showErrorNotification } from "@/shared/utils/notifications";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export default function UniqueIdGeneratorButton() {
  const client = useApiClient();
  const { data, isPending, isError } = useQuery({
    queryKey: [client.unique_ids.token.$url()],
    queryFn: () => client.unique_ids.token.$get().unwrap(),
  });
  if (isError) {
    showErrorNotification(
      "Klarte ikke hente autentiseringstoken for unik ID-generering",
    );
  }
  return (
    <Button
      loading={isPending}
      component={"a"}
      href={publicApiClient.unique_ids
        .download_pdf({ token: data ?? "" })
        .$url()}
      leftSection={<IconFileDownload />}
    >
      Last ned PDF
    </Button>
  );
}
