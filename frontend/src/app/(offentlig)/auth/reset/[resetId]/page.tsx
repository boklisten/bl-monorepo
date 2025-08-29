import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import PasswordReset from "@/components/user/PasswordReset";

export const metadata: Metadata = {
  title: "Lag nytt passord",
  description: "Lag et nytt passord, slik at du får tilgang på kontoen din.",
};

export default async function PasswordResetPage({
  params,
}: PageProps<"/auth/reset/[resetId]">) {
  const { resetId } = await params;
  return (
    <Container size={"xs"}>
      <Stack>
        <Title>Lag nytt passord</Title>
        <PasswordReset resetId={resetId} />
      </Stack>
    </Container>
  );
}
