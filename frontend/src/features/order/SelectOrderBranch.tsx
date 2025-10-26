"use client";
import { Branch } from "@boklisten/backend/shared/branch";
import { Divider, NavLink, Text } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import unpack from "@/shared/utils/bl-api-request";
import { publicApiClient } from "@/shared/utils/publicApiClient";

const capitalize = (s: string) =>
  s.length > 0 ? s[0]?.toUpperCase() + s.slice(1) : "";

export default function SelectOrderBranch({
  cachedBranches,
}: {
  cachedBranches: Branch[];
}) {
  const branchQuery = {
    query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
  };
  const { data } = useQuery({
    queryKey: [publicApiClient.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      publicApiClient
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const branches = data ?? cachedBranches;

  const groupedBranches = Map.groupBy(branches, (branch) =>
    capitalize(branch.location.region),
  );
  return (
    <>
      {groupedBranches
        .entries()
        .toArray()
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
                component={Link}
                key={branch.id}
                leftSection={<IconSchool />}
                active={true}
                variant={"subtle"}
                // @ts-expect-error fixme: bad routing types
                href={`/bestilling/${branch.id}`}
                label={branch.name}
              />
            ))}
          </NavLink>
        ))}
      <Divider label={"eller"} my={"xs"} />
      <Text>Jeg går ikke går på noen skole (bøker til overs)</Text>
      <NavLink
        component={Link}
        leftSection={<IconSchool />}
        fw={"bold"}
        bg={"brand"}
        c={"#fff"}
        style={{ borderRadius: 5 }}
        // @ts-expect-error fixme: bad routing types
        href={"/bestilling/63c5715d38bbec00484aa540"}
        label={"Fri privatist"}
      />
    </>
  );
}
