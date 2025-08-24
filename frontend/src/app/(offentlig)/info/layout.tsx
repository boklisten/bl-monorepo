import { Container, Stack } from "@mantine/core";
import { ReactNode } from "react";

import InfoPagesNavigation from "@/app/(offentlig)/info/InfoPagesNavigation";

export default function InfoPageLayout({ children }: { children: ReactNode }) {
  return (
    <Container>
      <Stack>
        <InfoPagesNavigation />
        {children}
      </Stack>
    </Container>
  );
}
