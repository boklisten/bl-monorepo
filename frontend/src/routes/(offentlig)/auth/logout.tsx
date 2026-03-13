import { Container, Stack, Title } from "@mantine/core";

import AuthLogoutComponent from "@/features/auth/AuthLogoutComponent";
import CountdownToRedirect from "@/shared/components/CountdownToRedirect";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/logout")({
  head: () => ({
    meta: [{ title: "Du er nå logget ut | Boklisten.no" }],
  }),
  component: LogoutPage,
});

function LogoutPage() {
  return (
    <Container size={"md"}>
      <Stack>
        <Title ta={"center"}>Du er nå logget ut</Title>
        <CountdownToRedirect seconds={5} path={"/"} shouldReplaceInHistory />
        <AuthLogoutComponent />
      </Stack>
    </Container>
  );
}
