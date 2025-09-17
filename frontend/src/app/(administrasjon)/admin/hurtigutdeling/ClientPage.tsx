"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Box, Button, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUserEdit } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import UnlockUserMatchesButton from "@/features/matches/UnlockUserMatchesButton";
import RapidHandoutDetails from "@/features/rapid-handout/RapidHandoutDetails";
import UserDetailSearchField from "@/features/rapid-handout/UserDetailSearchField";
import AdministrateUserSignatures from "@/features/signatures/AdministrateUserSignatures";
import AdministrateUserForm from "@/features/user/AdministrateUserForm";
import useApiClient from "@/shared/hooks/useApiClient";

export default function ClientPage() {
  const [searchUserDetail, setSearchUserDetail] = useState<UserDetail | null>(
    null,
  );

  const client = useApiClient();
  const { data: freshUserDetail } = useQuery({
    queryKey: [
      client.v2.user_details
        .id({ detailsId: searchUserDetail?.id ?? "" })
        .$url(),
      searchUserDetail,
    ],
    queryFn: () =>
      searchUserDetail
        ? client.v2.user_details
            .id({ detailsId: searchUserDetail.id })
            .$get()
            .unwrap()
        : null,
  });

  const userDetail = freshUserDetail ?? searchUserDetail;

  return (
    <Stack>
      <UserDetailSearchField
        onSelectedResult={(userDetail) => {
          setSearchUserDetail(userDetail);
        }}
      />
      {userDetail && (
        <Box>
          <Button
            leftSection={<IconUserEdit />}
            onClick={() =>
              modals.open({
                title: "Rediger brukerdetaljer",
                children: (
                  <Stack>
                    <UnlockUserMatchesButton userDetailId={userDetail.id} />
                    <AdministrateUserForm userDetail={userDetail} />
                    <AdministrateUserSignatures userDetail={userDetail} />
                  </Stack>
                ),
              })
            }
          >
            Rediger brukerdetaljer
          </Button>
        </Box>
      )}
      {userDetail && <RapidHandoutDetails customer={userDetail} />}
    </Stack>
  );
}
