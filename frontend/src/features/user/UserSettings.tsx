"use client";
import { Skeleton, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import UserSettingsForm from "@/features/user/UserSettingsForm";
import useApiClient from "@/shared/api/useApiClient";

const UserSettings = () => {
  const client = useApiClient();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: [client.v2.user_details.me.$url()],
    queryFn: () => client.v2.user_details.me.$get().unwrap(),
  });

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height={60} />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton height={40} key={`s-${index}`} />
        ))}
      </Stack>
    );
  }

  if (isError || !data) {
    router.push("/auth/login?redirect=user-settings");
    return null;
  }

  return <UserSettingsForm userDetail={data} />;
};

export default UserSettings;
