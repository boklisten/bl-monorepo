import { Button } from "@mantine/core";
import { IconLockOpen } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";

import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function UnlockUserMatchesButton({
  userDetailId,
}: {
  userDetailId: string;
}) {
  const client = useApiClient();
  const unlockUserMatchesMutation = useMutation({
    mutationFn: () =>
      client.user_matches.lock.$post({
        customerId: userDetailId,
        userMatchesLocked: false,
      }),
    onSuccess: () => showSuccessNotification("Overleveringene ble låst opp!"),
    onError: () =>
      showErrorNotification("Klarte ikke låse opp overleveringene"),
  });

  return (
    <Button
      leftSection={<IconLockOpen />}
      onClick={() => unlockUserMatchesMutation.mutate()}
      loading={unlockUserMatchesMutation.isPending}
    >
      Lås opp overleveringer
    </Button>
  );
}
