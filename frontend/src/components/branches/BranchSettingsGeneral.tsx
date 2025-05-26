import { Branch } from "@boklisten/backend/shared/branch/branch";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";

import BranchAutocomplete from "@/components/branches/BranchAutocomplete";
import BranchAutocompleteMultiple from "@/components/branches/BranchAutocompleteMultiple";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function BranchSettingsGeneral({
  branch,
}: {
  branch: Branch | null;
}) {
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
  return (
    <>
      <TextField label={"Fullt navn"} defaultValue={branch?.name} required />
      <TextField
        label={"Lokalt navn"}
        defaultValue={branch?.localName}
        required
      />
      <BranchAutocomplete
        label={"Tilhører"}
        branches={branches ?? []}
        onChange={(selected) => console.log(selected)}
      />
      <TextField
        label={"Delt inn i"}
        defaultValue={branch?.childLabel}
      ></TextField>
      <BranchAutocompleteMultiple
        label={"Består av"}
        branches={branches ?? []}
        onChange={(selected) => console.log(selected)}
      />
    </>
  );
}
