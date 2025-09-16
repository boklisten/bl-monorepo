import { Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import WaitingList from "@/features/waiting-list/WaitingList";

export const metadata: Metadata = {
  title: "Venteliste",
};

export default function WaitingListPage() {
  return (
    <Stack>
      <Title>Venteliste</Title>
      <WaitingList />
    </Stack>
  );
}
