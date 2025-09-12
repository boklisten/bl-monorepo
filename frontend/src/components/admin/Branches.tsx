"use client";

import { Branch } from "@boklisten/backend/shared/branch";
import { Box, Button, Divider, Grid, Stack, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import BranchSettings from "@/components/branches/BranchSettings";
import SelectBranchTreeView from "@/components/branches/SelectBranchTreeView";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";

export default function Branches() {
  const client = useApiClient();
  const branchQuery = {
    query: { sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  return (
    <Stack>
      <Box>
        <Button
          leftSection={<IconPlus />}
          onClick={() =>
            modals.open({
              title: "Opprett filial",
              children: (
                <BranchSettings
                  existingBranch={null}
                  afterSubmit={() => modals.closeAll()}
                />
              ),
            })
          }
        >
          Opprett filial
        </Button>
      </Box>
      <Divider />
      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <SelectBranchTreeView
            branches={branches ?? []}
            onSelect={(branchId) => {
              setSelectedBranch(
                branches?.find((branch) => branch.id === branchId) ?? null,
              );
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 9 }}>
          {selectedBranch && (
            <Stack>
              <Title>Rediger filial</Title>
              <BranchSettings existingBranch={selectedBranch} />
            </Stack>
          )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
