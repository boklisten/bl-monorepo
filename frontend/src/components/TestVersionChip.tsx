import { Badge, Tooltip } from "@mantine/core";

import { getEnv, isProduction } from "@/utils/env";

export default function TestVersionChip() {
  if (isProduction()) return;
  const env = getEnv();

  return (
    <Tooltip
      label={
        "Dette er en test-versjon av Boklisten.no, koblet til en test-database, som tilbakestilles hver natt. Endringer og ordre er derfor IKKE permanente her."
      }
    >
      <div>
        <Badge
          className="flex sm:hidden"
          size="lg"
          variant="gradient"
          gradient={{ from: "orange", to: "yellow", deg: 90 }}
        >
          {env.charAt(0)}
        </Badge>
        <Badge
          className="hidden sm:flex"
          size="lg"
          variant="gradient"
          gradient={{ from: "orange", to: "yellow", deg: 90 }}
        >
          {env}
        </Badge>
      </div>
    </Tooltip>
  );
}
