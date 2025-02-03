"use client";
import { UserDetail } from "@boklisten/backend/shared/user/user-detail/user-detail";
import { Card } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import UserDetailEditor from "@/components/user/user-detail-editor/UserDetailEditor";
import UserDetailEditorSkeleton from "@/components/user/user-detail-editor/UserDetailEditorSkeleton";
import useApiClient from "@/utils/api/useApiClient";

const UserSettings = () => {
  const client = useApiClient();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetail>();

  useEffect(() => {
    try {
      const { details } = getAccessTokenBody();
      const fetchDetails = async () => {
        const [userDetails] = await BlFetcher.get<[UserDetail]>(
          client.$url("collection.userdetails.getId", {
            params: { id: details },
          }),
        );
        setUserDetails(userDetails);
      };
      fetchDetails();
    } catch {
      router.push("/auth/login?redirect=user-settings");
    }
  }, [client, router]);

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
