import { Stack, Title } from "@mantine/core";
import WaitingList from "@/features/waiting-list/WaitingList.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(administrasjon)/admin/venteliste")({
  head: () => ({
    meta: [{ title: "Venteliste | bl-admin" }],
  }),
  component: WaitingListPage,
});

function WaitingListPage() {
  return (
    <Stack>
      <Title>Venteliste</Title>
      <WaitingList />
    </Stack>
  );
}
