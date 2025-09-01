import { PictureAsPdf } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Metadata } from "next";

import { publicApiClient } from "@/utils/api/publicApiClient";

export const metadata: Metadata = {
  title: "Unike IDer",
};

export default function DatabaseUniqueIdPage() {
  return (
    <Stack gap={2}>
      <Typography variant={"h2"}>
        Lag utskriftsklar PDF med unike IDer
      </Typography>
      <Box>
        <Button
          component={"a"}
          href={publicApiClient.unique_ids.download_pdf.$url()}
          variant={"contained"}
          startIcon={<PictureAsPdf />}
        >
          Last ned PDF
        </Button>
      </Box>
    </Stack>
  );
}
