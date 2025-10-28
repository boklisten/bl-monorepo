"use client";
import { Container, Stack, Title } from "@mantine/core";
import { Suspense } from "react";

import AuthLogoutComponent from "@/features/auth/AuthLogoutComponent";
import CountdownToRedirect from "@/shared/components/CountdownToRedirect";

export default function LogoutPage() {
  return (
    <Container size={"md"}>
      <Stack>
        <Title ta={"center"}>Du er nå logget ut</Title>
        <Suspense>
          <CountdownToRedirect seconds={5} path={"/"} shouldReplaceInHistory />
        </Suspense>
        <AuthLogoutComponent />
      </Stack>
    </Container>
  );
}
