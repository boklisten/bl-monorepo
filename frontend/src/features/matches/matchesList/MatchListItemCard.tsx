import { Button, Card, Stack } from "@mantine/core";
import { PropsWithChildren } from "react";

import NextAnchor from "@/shared/components/NextAnchor";

export default function MatchListItemCard({
  finished,
  matchId,
  matchType,
  children,
}: PropsWithChildren<{
  finished: boolean;
  matchId: string;
  matchType: "stand" | "user";
}>) {
  return (
    <NextAnchor
      underline={"never"}
      href={`/overleveringer/${matchType}/${matchId}`}
    >
      <Card
        shadow={finished ? "xs" : "lg"}
        withBorder
        bg={finished ? "rgba(134, 200, 134, 0.2)" : ""}
      >
        <Stack gap={"xs"}>
          {children}
          <Button
            mt={"md"}
            variant={finished ? "transparent" : "filled"}
            color={"green"}
          >
            Åpne
          </Button>
        </Stack>
      </Card>
    </NextAnchor>
  );
}
