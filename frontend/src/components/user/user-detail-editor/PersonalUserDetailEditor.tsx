"use client";
import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Divider, Stack, Typography } from "@mui/material";
import Container from "@mui/material/Container";

import FacebookButton from "@/components/user/FacebookButton";
import GoogleButton from "@/components/user/GoogleButton";
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
    <Container component="main" maxWidth="xs">
      <Stack alignItems="center" mt={4}>
        <Typography variant="h1" mb={2}>
          {isSignUp ? "Registrer deg" : "Brukerinnstillinger"}
        </Typography>
        {isSignUp && (
          <>
            <Stack gap={2} sx={{ width: "100%", alignItems: "center" }}>
              <VippsButton verb={"register"} />
              <FacebookButton label={"Registrer deg med Facebook"} />
              <GoogleButton label={"Registrer deg med Google"} />
            </Stack>
            <Divider sx={{ width: "100%", my: 3 }}>
              Eller, registrer deg med e-post
            </Divider>
          </>
        )}
        <UserDetailsEditor
          userDetails={userDetails}
          variant={isSignUp ? "signup" : "personal"}
        />
      </Stack>
    </Container>
  );
}
