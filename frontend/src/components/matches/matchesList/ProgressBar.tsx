import { Group, Stack } from "@mantine/core";
import { LinearProgress, linearProgressClasses } from "@mui/material";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { ReactNode } from "react";

import muiTheme from "@/utils/muiTheme";

export default function ProgressBar({
  percentComplete,
  subtitle,
}: {
  percentComplete: number;
  subtitle?: ReactNode;
}) {
  const finished = percentComplete >= 100;

  if (finished) {
    return (
      <Group gap={5}>
        <IconCircleCheckFilled color="green" />
        {subtitle}
      </Group>
    );
  }

  return (
    <Stack gap={5}>
      <LinearProgress
        value={percentComplete}
        variant="determinate"
        sx={{
          height: "0.5rem",
          borderRadius: "0.8rem",
          [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor:
              muiTheme.palette.grey[
                muiTheme.palette.mode === "light" ? 300 : 700
              ],
          },
          [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5,
            backgroundColor: muiTheme.palette.success.main,
          },
        }}
      />
      {subtitle}
    </Stack>
  );
}
