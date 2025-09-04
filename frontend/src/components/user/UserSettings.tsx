"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Skeleton, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getAccessTokenBody } from "@/api/token";
import UserDetailsEditor from "@/components/user/user-detail-editor/UserDetailsEditor";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";

const UserSettings = () => {
  const client = useApiClient();
  const router = useRouter();

  const { data: userDetails, isError } = useQuery({
    queryKey: ["userDetails"],
    queryFn: () =>
      client
        .$route("collection.userdetails.getId", {
          id: getAccessTokenBody().details,
        })
        .$get()
        .then(unpack<[UserDetail]>),
  });

  if (isError) {
    router.push("/auth/login?redirect=user-settings");
    return null;
  }
  if (!userDetails) {
    return (
      <Stack>
        <Skeleton height={60} />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton height={60} key={`s-${index}`} />
        ))}
      </Stack>
    );
  }

  return (
    <UserDetailsEditor userDetails={userDetails[0]} variant={"personal"} />
  );
};

export default UserSettings;
