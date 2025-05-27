"use client";
import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import { Card } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import UserDetailEditor from "@/components/user/user-detail-editor/UserDetailEditor";
import UserDetailEditorSkeleton from "@/components/user/user-detail-editor/UserDetailEditorSkeleton";
import useApiClient from "@/utils/api/useApiClient";

const UserSettings = () => {
  const client = useApiClient();
  const router = useRouter();

  const { data: userDetails, isError } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const { details } = getAccessTokenBody();
      const [userDetails] = await BlFetcher.get<[UserDetail]>(
        client.$url("collection.userdetails.getId", {
          params: { id: details },
        }),
      );
      return userDetails;
    },
  });

  if (isError) {
    router.push("/auth/login?redirect=user-settings");
    return null;
  }

  return (
    <Card sx={{ paddingBottom: 4 }}>
      {userDetails ? (
        <UserDetailEditor userDetails={userDetails} />
      ) : (
        <UserDetailEditorSkeleton />
      )}
    </Card>
  );
};

export default UserSettings;
