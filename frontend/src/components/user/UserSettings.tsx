"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Card } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getAccessTokenBody } from "@/api/token";
import PersonalUserDetailEditor from "@/components/user/user-detail-editor/PersonalUserDetailEditor";
import UserDetailEditorSkeleton from "@/components/user/user-detail-editor/UserDetailEditorSkeleton";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

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

  return (
    <Card sx={{ paddingBottom: 4 }}>
      {userDetails ? (
        <PersonalUserDetailEditor userDetails={userDetails[0]} />
      ) : (
        <UserDetailEditorSkeleton />
      )}
    </Card>
  );
};

export default UserSettings;
