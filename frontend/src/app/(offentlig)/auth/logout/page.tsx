"use client";
import { Container, Stack, Title } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import CountdownToRedirect from "@/shared/components/CountdownToRedirect";
import useAuth from "@/shared/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    logout();
  }, [logout, mounted, router]);

  return (
    <Container size={"md"}>
      <Stack>
        <Title ta={"center"}>Du er nå logget ut</Title>
        <CountdownToRedirect seconds={10} path={"/"} shouldReplaceInHistory />
      </Stack>
    </Container>
  );
}
