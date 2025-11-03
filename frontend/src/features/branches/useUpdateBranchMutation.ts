import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "@tuyau/client";

import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  const client = useApiClient();

  return useMutation({
    mutationFn: (
      updatedBranch: InferRequestType<typeof client.v2.branches.$patch>,
    ) => client.v2.branches.$patch(updatedBranch).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [
          client.$url("collection.branches.getAll", {
            query: { sort: "name" },
          }),
        ],
      }),
    onSuccess: () => showSuccessNotification("Filial ble oppdatert!"),
    onError: () => showErrorNotification("Klarte ikke oppdatere filial!"),
  });
}
