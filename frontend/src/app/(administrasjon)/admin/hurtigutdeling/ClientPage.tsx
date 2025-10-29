"use client";
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
  const [userDetailsId, setUserDetailsId] = useState<string | null>(null);

  const client = useApiClient();
  const { data } = useQuery({
    queryKey: [
      client.v2.user_details.id({ detailsId: userDetailsId ?? "" }).$url(),
      userDetailsId,
    ],
    queryFn: () =>
      userDetailsId
        ? client.v2.user_details
            .id({ detailsId: userDetailsId ?? "" })
            .$get()
            .unwrap()
        : null,
  });

  return (
    <Stack>
      <UserDetailSearchField
        onSelectedResult={(userDetail) => {
          setUserDetailsId(userDetail?.id ?? null);
        }}
      />
      {data && (
        <Box>
          <Button
            leftSection={<IconUserEdit />}
            onClick={() =>
              modals.open({
                title: "Rediger brukerdetaljer",
                children: (
                  <Stack>
                    <UnlockUserMatchesButton
                      userDetailId={userDetailsId ?? ""}
                    />
                    <AdministrateUserForm userDetail={data} />
                    <AdministrateUserSignatures userDetail={data} />
                  </Stack>
                ),
              })
            }
          >
            Rediger brukerdetaljer
          </Button>
        </Box>
      )}
      {data && <RapidHandoutDetails customer={data} />}
    </Stack>
  );
}
