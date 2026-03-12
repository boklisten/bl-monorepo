import { Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(administrasjon)/admin/")({
  head: () => ({
    meta: [{ title: "bl-admin" }],
  }),
  component: AdminStartPage,
});

function AdminStartPage() {
  return (
    <>
      <Text ta={"center"}>
        Velkommen til bl-admin! Her finner du alle verktøyene du trenger for å dele ut og samle inn
        bøker
      </Text>
    </>
  );
}
