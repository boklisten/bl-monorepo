"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Divider, Stack, Title } from "@mantine/core";

import UserDetailsEditor from "@/components/user/user-detail-editor/UserDetailsEditor";
import VippsButton from "@/components/user/VippsButton";

export default function PersonalUserDetailEditor({
  isSignUp,
  userDetails = {} as UserDetail,
}: {
  isSignUp?: boolean;
  userDetails?: UserDetail;
}) {
  return (
    <Stack>
      <Title ta={"center"}>
        {isSignUp ? "Registrer deg" : "Brukerinnstillinger"}
      </Title>
      {isSignUp && (
        <>
          <VippsButton verb={"register"} />
          <Divider label={"Eller, registrer deg med e-post"} />
        </>
      )}
      <UserDetailsEditor
        userDetails={userDetails}
        variant={isSignUp ? "signup" : "personal"}
      />
    </Stack>
  );
}
