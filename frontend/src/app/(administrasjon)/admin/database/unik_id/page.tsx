import { Box, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import UniqueIdGeneratorButton from "@/features/unique_id_generation/UniqueIdGeneratorButton";

export const metadata: Metadata = {
  title: "Unike IDer",
};

export default function DatabaseUniqueIdPage() {
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
