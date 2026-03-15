import { Button, Card, Stack } from "@mantine/core";

import TanStackAnchor from "@/shared/components/TanStackAnchor";
import type { ReactNode } from "react";

export default function MatchListItemCard({
  finished,
  matchId,
  matchType,
  children,
}: {
  finished: boolean;
  matchId: string;
  matchType: "stand" | "user";
  children: ReactNode;
}) {
  return (
    <TanStackAnchor
      underline={"never"}
      to={
        matchType === "user"
          ? "/overleveringer/user/$userMatchId"
          : "/overleveringer/stand/$standMatchId"
      }
      params={matchType === "user" ? { userMatchId: matchId } : { standMatchId: matchId }}
    >
      <Card
        shadow={finished ? "xs" : "lg"}
        withBorder
        bg={finished ? "rgba(134, 200, 134, 0.2)" : ""}
      >
        <Stack gap={"xs"}>
          {children}
          <Button mt={"md"} variant={finished ? "transparent" : "filled"} color={"green"}>
            Åpne
          </Button>
        </Stack>
      </Card>
    </TanStackAnchor>
  );
}
