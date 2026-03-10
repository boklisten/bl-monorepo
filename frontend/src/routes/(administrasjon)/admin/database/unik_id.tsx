import { Box, Stack, Title } from "@mantine/core";
import AuthGuard from "@/features/auth/AuthGuard.tsx";
import UniqueIdGeneratorButton from "@/features/unique_id_generation/UniqueIdGeneratorButton.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(administrasjon)/admin/database/unik_id")({
  head: () => ({
    meta: [{ title: "Unike IDer | bl-admin" }],
  }),
  component: DatabaseUniqueIdPage,
});

function DatabaseUniqueIdPage() {
  return (
    <AuthGuard requiredPermission={"admin"}>
      <Stack>
        <Title>Lag utskriftsklar PDF med unike IDer</Title>
        <Box>
          <UniqueIdGeneratorButton />
        </Box>
      </Stack>
    </AuthGuard>
  );
}
