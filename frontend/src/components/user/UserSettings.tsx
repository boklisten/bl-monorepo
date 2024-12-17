"use client";
import BlFetcher from "@frontend/api/blFetcher";
import { getAccessTokenBody } from "@frontend/api/token";
import UserDetailEditor from "@frontend/components/user/user-detail-editor/UserDetailEditor";
import UserDetailEditorSkeleton from "@frontend/components/user/user-detail-editor/UserDetailEditorSkeleton";
import BL_CONFIG from "@frontend/utils/bl-config";
import { Card } from "@mui/material";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UserSettings = () => {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetail>();

  useEffect(() => {
    try {
      const { details } = getAccessTokenBody();
      const fetchDetails = async () => {
        const [userDetails] = await BlFetcher.get<[UserDetail]>(
          `${BL_CONFIG.collection.userDetail}/${details}`,
        );
        setUserDetails(userDetails);
      };
      fetchDetails();
    } catch {
      router.push("/auth/login?redirect=user-settings");
    }
  }, [router]);

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
