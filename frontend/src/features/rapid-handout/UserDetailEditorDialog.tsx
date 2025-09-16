import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Button, Stack } from "@mantine/core";
import { IconLockOpen } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import AdministrateUserSignatures from "@/features/signatures/AdministrateUserSignatures";
import AdministrateUserForm from "@/features/user/AdministrateUserForm";
import unpack from "@/shared/api/bl-api-request";
import useApiClient from "@/shared/api/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/ui/notifications";

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
