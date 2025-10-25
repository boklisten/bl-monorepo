import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import AuthFailureReasonAlert from "@/features/auth/AuthFailureReasonAlert";
import NextAnchor from "@/shared/components/NextAnchor";
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
        <NextAnchor href={"/auth/login"}>
          Tilbake til innloggingssiden
        </NextAnchor>
      </Stack>
    </Container>
  );
}
