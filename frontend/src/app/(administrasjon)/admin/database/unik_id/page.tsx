import { Box, Button, Stack, Title } from "@mantine/core";
import { IconFileDownload } from "@tabler/icons-react";
import { Metadata } from "next";

import { publicApiClient } from "@/utils/publicApiClient";

export const metadata: Metadata = {
  title: "Unike IDer",
};

export default function DatabaseUniqueIdPage() {
  return (
    <Stack>
      <Title>Lag utskriftsklar PDF med unike IDer</Title>
      <Box>
        <Button
          component={"a"}
          href={publicApiClient.unique_ids.download_pdf.$url()}
          leftSection={<IconFileDownload />}
        >
          Last ned PDF
        </Button>
      </Box>
    </Stack>
  );
}
