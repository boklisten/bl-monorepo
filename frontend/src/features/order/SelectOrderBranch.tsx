import { Divider, NavLink, Skeleton, Stack, Text } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import TanStackAnchor from "@/shared/components/TanStackAnchor.tsx";

import unpack from "@/shared/utils/bl-api-request";
import { publicApiClient } from "@/shared/utils/publicApiClient";
import type { Branch } from "@boklisten/backend/shared/branch.ts";

const capitalize = (s: string) => (s.length > 0 ? s[0]?.toUpperCase() + s.slice(1) : "");

export default function SelectOrderBranch() {
  const branchQuery = {
    query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [publicApiClient.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      publicApiClient
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  if (!branches) {
    return (
      <Stack>
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
        <Skeleton h={35} w={"100%"} />
      </Stack>
    );
  }

  const groupedBranches = branches.reduce((m, b) => {
    const k = capitalize(b.location.region);

    if (m.has(k)) {
      m.get(k)!.push(b);
    } else {
      m.set(k, [b]);
    }

    return m;
  }, new Map<string, Branch[]>());

  return (
    <>
      {Array.from(groupedBranches.entries())
        .sort((a, b) => a[0].localeCompare(b[0], "no"))
        .map(([region, branches]) => (
          <NavLink
            key={region}
            label={region}
            fw={"bold"}
            bg={"brand"}
            c={"#fff"}
            style={{ borderRadius: 5 }}
          >
            {branches.map((branch) => (
              <NavLink
                component={TanStackAnchor}
                key={branch.id}
                leftSection={<IconSchool />}
                active={true}
                variant={"subtle"}
                to={`/bestilling/${branch.id}`}
                label={branch.name}
              />
            ))}
          </NavLink>
        ))}
      <Divider label={"eller"} my={"xs"} />
      <Text>Jeg går ikke går på noen skole (bøker til overs)</Text>
      <NavLink
        component={TanStackAnchor}
        leftSection={<IconSchool />}
        fw={"bold"}
        bg={"brand"}
        c={"#fff"}
        style={{ borderRadius: 5 }}
        to={"/bestilling/63c5715d38bbec00484aa540"}
        label={"Fri privatist"}
      />
    </>
  );
}
