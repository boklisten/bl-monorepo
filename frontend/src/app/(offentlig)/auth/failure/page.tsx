import { Anchor, Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AuthFailureReasonAlert from "@/features/auth/AuthFailureReasonAlert";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";

export const metadata: Metadata = {
  title: "Klarte ikke logge inn",
  description: `Vi klarte ikke å logge deg inn. ${PLEASE_TRY_AGAIN_TEXT}`,
};

export default function AuthFailurePage() {
  return (
    <Container>
      <Stack align={"center"}>
        <Title>Vi klarte ikke logge deg inn</Title>
        <Suspense>
          <AuthFailureReasonAlert />
        </Suspense>
        <Anchor component={Link} href={"/auth/login"}>
          Tilbake til innloggingssiden
        </Anchor>
      </Stack>
    </Container>
  );
}
