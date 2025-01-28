"use client";
import { UserDetail } from "@boklisten/backend/shared/src/user/user-detail/user-detail";
import { Card } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import BlFetcher from "@/api/blFetcher";
import { getAccessTokenBody } from "@/api/token";
import UserDetailEditor from "@/components/user/user-detail-editor/UserDetailEditor";
import UserDetailEditorSkeleton from "@/components/user/user-detail-editor/UserDetailEditorSkeleton";
import BL_CONFIG from "@/utils/bl-config";

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
