"use client";
import { Branch } from "@boklisten/backend/shared/branch";
import { Divider, NavLink, Skeleton, Text } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import unpack from "@/shared/utils/bl-api-request";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export default function SelectOrderBranch() {
  const branchQuery = {
    query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
  };
  const { data, isLoading, isError } = useQuery({
    queryKey: [publicApiClient.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      publicApiClient
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });
  const capitalize = (s: string) =>
    s.length > 0 ? s[0]?.toUpperCase() + s.slice(1) : "";

  if (isLoading) {
    return (
      <>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <Skeleton height={40} key={`skeleton-${index}`} />
        ))}
      </>
    );
  }

  if (isError || !data) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn filialer"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  const groupedBranches = Map.groupBy(data ?? [], (branch) =>
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
                href={`/fastbuy/courses?branch=${branch.id}`}
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
        href={"/fastbuy/courses?branch=63c5715d38bbec00484aa540"}
        label={"Fri privatist"}
      />
    </>
  );
}
