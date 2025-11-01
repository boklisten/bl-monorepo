"use client";

import { Branch } from "@boklisten/backend/shared/branch";
import { Box, Button, Divider, Grid, Stack, Tabs, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import BranchBaseSettings from "@/features/branches/BranchBaseSettings";
import BranchSettings from "@/features/branches/BranchSettings";
import SelectBranchTreeView from "@/shared/components/SelectBranchTreeView";
import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";

export default function BranchManager() {
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

  const createBranchModalId = "create-branch-modal";
  return (
    <Stack>
      <Box>
        <Button
          leftSection={<IconPlus />}
          onClick={() =>
            modals.open({
              modalId: createBranchModalId,
              title: "Opprett filial",
              children: (
                <BranchBaseSettings
                  onSuccess={(newBranch) => {
                    if (newBranch) {
                      setSelectedBranch(newBranch);
                    }
                    modals.close(createBranchModalId);
                  }}
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
            label={"Velg filial"}
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
              <Title>{selectedBranch.name}</Title>
              <Tabs defaultValue={"base"}>
                <Tabs.List mb={"md"}>
                  <Tabs.Tab value={"base"}>Generelt</Tabs.Tab>
                  <Tabs.Tab value={"todo"}>TODO</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value={"base"}>
                  <BranchBaseSettings existingBranch={selectedBranch} />
                </Tabs.Panel>
                <Tabs.Panel value={"todo"}>
                  <BranchSettings
                    key={selectedBranch?.id}
                    existingBranch={selectedBranch}
                  />
                </Tabs.Panel>
              </Tabs>
            </Stack>
          )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
