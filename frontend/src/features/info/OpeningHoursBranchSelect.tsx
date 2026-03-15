import { Select } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useLocation, useNavigate } from "@tanstack/react-router";
import { publicApi } from "@/shared/utils/publicApiClient";

const OpeningHoursBranchSelect = () => {
  const { data: branches } = useQuery(publicApi.branches.getPublic.queryOptions());

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
      data={(branches ?? [])
        .filter((branch) => branch.type === "privatist")
        .map((branch) => ({
          value: branch.id,
          label: branch.name,
        }))}
    ></Select>
  );
};

export default OpeningHoursBranchSelect;
