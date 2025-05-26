import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function BranchSettingsGeneral() {
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

  const { register, setValue } = useFormContext();

  return (
    <>
      <TextField
        label={"Fullt navn"}
        required
        {...register("name", { required: true })}
      />
      <TextField
        label={"Lokalt navn"}
        required
        {...register("localName", { required: true })}
      />
      <Autocomplete
        /** @ts-expect-error --exactOptionalPropertyTypes not supported by MUI */
        renderInput={(params) => <TextField {...params} label={"Tilhører"} />}
        options={
          branches?.map((branch) => ({
            id: branch.id,
            label: branch.name,
          })) ?? []
        }
        onChange={(_, selected) => setValue("parentBranch", selected?.id ?? "")}
      />
      <TextField label={"Delt inn i"} {...register("childLabel")}></TextField>
      <Autocomplete
        /** @ts-expect-error --exactOptionalPropertyTypes not supported by MUI */
        renderInput={(params) => <TextField {...params} label={"Består av"} />}
        options={
          branches?.map((branch) => ({
            id: branch.id,
            label: branch.name,
          })) ?? []
        }
        multiple
        onChange={(_, selected) =>
          setValue("childBranches", selected?.map((s) => s.id) ?? [])
        }
      />
    </>
  );
}
