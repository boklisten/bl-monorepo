import { Container, Loader, Stack, Title } from "@mantine/core";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useApiClient from "@/shared/hooks/useApiClient.ts";
import useAuthLinker from "@/shared/hooks/useAuthLinker.ts";
import { useEffect, useEffectEvent } from "react";
import { login } from "@/shared/hooks/useAuth.ts";

export const Route = createFileRoute("/(offentlig)/auth/token")({
  head: () => ({
    meta: [
      { title: "Logger inn... | Boklisten.no" },
      {
        description: "Du blir nå logget inn. Vennligst vent.",
      },
    ],
  }),
  validateSearch: (search) => ({
    refreshToken: (search["refresh_token"] as string) || "",
    accessToken: (search["access_token"] as string) || "",
  }),
  component: TokenPage,
});

function TokenPage() {
  const client = useApiClient();
  const { redirectToCaller } = useAuthLinker();
  const { refreshToken, accessToken } = Route.useSearch();
  const navigate = useNavigate();

  const onLogin = useEffectEvent(async (tokens: { accessToken: string; refreshToken: string }) => {
    const success = login(tokens);
    if (!success) {
      navigate({ to: "/auth/failure" });
      return;
    }
    const userDetail = await client.v2.user_details.me.$get().unwrap();
    if (userDetail?.tasks?.confirmDetails || userDetail?.tasks?.signAgreement) {
      navigate({ to: "/oppgaver" });
    } else {
      redirectToCaller();
    }
  });
  useEffect(() => {
    if (accessToken && refreshToken) {
      void onLogin({ accessToken, refreshToken });
    }
  }, [accessToken, refreshToken]);
  return (
    <Container size={"xs"}>
      <Stack align={"center"}>
        <Title>Du blir nå logget inn...</Title>
        <Loader />
      </Stack>
    </Container>
  );
}
