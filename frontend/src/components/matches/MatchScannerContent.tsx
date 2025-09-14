import { Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useEffect } from "react";

import { ItemStatus } from "@/components/matches/matches-helper";
import ProgressBar from "@/components/matches/matchesList/ProgressBar";
import MatchItemTable from "@/components/matches/MatchItemTable";

export default function MatchScannerContent({
  expectedItems,
  fulfilledItems,
  itemStatuses,
}: {
  itemStatuses: ItemStatus[];
  expectedItems: string[];
  fulfilledItems: string[];
}) {
  useEffect(() => {
    if (expectedItems.length === fulfilledItems.length) {
      modals.closeAll();
    }
  }, [expectedItems.length, fulfilledItems.length]);
  return (
    <Stack mt={"xs"}>
      <ProgressBar
        percentComplete={(fulfilledItems.length * 100) / expectedItems.length}
        subtitle={
          <Text ta={"center"}>
            {fulfilledItems.length} av {expectedItems.length} bøker mottatt
          </Text>
        }
      />
      <MatchItemTable
        itemFilter={expectedItems}
        itemStatuses={itemStatuses}
        isSender={false}
      />
    </Stack>
  );
}
