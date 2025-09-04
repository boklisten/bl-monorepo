"use client";
import { Branch } from "@boklisten/backend/shared/branch";
import { Select } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";

const BranchSelect = () => {
  const client = useApiClient();
  const branchQuery = {
    query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const [selectedBranchId, setSelectedBranchId] = useLocalStorage({
    key: "selectedBranchId",
  });

  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (selectedBranchId && pathName.includes("info/branch")) {
      router.replace(`/info/branch/${selectedBranchId}`);
    }
  }, [pathName, router, selectedBranchId]);

  return (
    <Select
      value={selectedBranchId ?? ""}
      label="Valgt skole"
      placeholder={"Din skole"}
      onChange={(value) => value && setSelectedBranchId(value)}
      data={(branches ?? []).map((branch) => ({
        value: branch.id,
        label: branch.name,
      }))}
    ></Select>
  );
};

export default BranchSelect;
