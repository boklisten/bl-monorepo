"use client";

import { Branch } from "@boklisten/backend/shared/branch";
import { Group, Skeleton } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import unpack from "@/shared/utils/bl-api-request";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export default function BranchLocationInfo({ branchId }: { branchId: string }) {
  const {
    data: branch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      publicApiClient.$url("collection.branches.getId", {
        params: { id: branchId },
      }),
    ],
    queryFn: async () => {
      const response = await publicApiClient
        .$route("collection.branches.getId", {
          id: branchId,
        })
        .$get();
      return unpack<[Branch]>(response)[0];
    },
  });
  if (isLoading) {
    return <Skeleton width={250} height={25} />;
  }
  if (isError) {
    return <ErrorAlert title={"Klarte ikke laste inn addresse"} />;
  }

  return (
    <Group gap={5}>
      <IconMapPin />
      {branch?.location?.address ?? "Ukjent"}
    </Group>
  );
}
