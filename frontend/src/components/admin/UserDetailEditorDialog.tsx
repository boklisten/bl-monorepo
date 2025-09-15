import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Stack } from "@mantine/core";
import { IconLockOpen } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import AdministrateUserSignatures from "@/components/admin/AdministrateUserSignatures";
import AdministrateUserForm from "@/components/user/AdministrateUserForm";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function UserDetailEditorDialog({
  initialUserDetails,
}: {
  initialUserDetails: UserDetail;
}) {
  const client = useApiClient();
  const { data: updatedUserDetails } = useQuery({
    queryKey: ["userDetails", initialUserDetails.id],
    queryFn: () =>
      client
        .$route("collection.userdetails.getId", {
          id: initialUserDetails.id,
        })
        .$get()
        .then(unpack<[UserDetail]>),
  });
  const userDetail = updatedUserDetails?.[0] ?? initialUserDetails;

  const unlockUserMatchesMutation = useMutation({
    mutationFn: () =>
      client.user_matches.lock.$post({
        customerId: userDetail.id,
        userMatchesLocked: false,
      }),
    onSuccess: () => showSuccessNotification("Overleveringene ble låst opp!"),
    onError: () =>
      showErrorNotification("Klarte ikke låse opp overleveringene"),
  });

  return (
    <Stack>
      <Button
        leftSection={<IconLockOpen />}
        onClick={() => unlockUserMatchesMutation.mutate()}
        loading={unlockUserMatchesMutation.isPending}
      >
        Lås opp overleveringer
      </Button>
      <Stack gap={"xl"}>
        <AdministrateUserForm userDetail={userDetail} />
        <AdministrateUserSignatures userDetail={userDetail} />
      </Stack>
    </Stack>
  );
}
