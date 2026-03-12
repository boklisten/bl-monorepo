import type { Branch } from "@boklisten/backend/shared/branch";
import { Select } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";
import { useLocation, useNavigate } from "@tanstack/react-router";

const OpeningHoursBranchSelect = () => {
  const client = useApiClient();
  const branchQuery = {
    query: {
      active: true,
      "isBranchItemsLive.online": true,
      type: "privatist",
      sort: "name",
    },
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

  const pathName = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedBranchId && pathName.includes("info/branch")) {
      navigate({ to: "/info/branch/$branchId", params: { branchId: selectedBranchId } });
    }
  }, [pathName, navigate, selectedBranchId]);

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

export default OpeningHoursBranchSelect;
