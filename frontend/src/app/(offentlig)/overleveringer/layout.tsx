import { Container, Stack } from "@mantine/core";

export default function MatchPagesLayout({
  children,
}: LayoutProps<"/overleveringer">) {
  return (
    <Container>
      <Stack>{children}</Stack>
    </Container>
  );
}
