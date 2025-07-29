import { Branch } from "@boklisten/backend/shared/branch";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function BranchSettingsGeneral({
  currentBranchId,
}: {
  currentBranchId: string | null;
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

  const { register, control } = useFormContext();

  const branchOptions =
    branches
      ?.filter((branch) => branch.id !== currentBranchId)
      .map((branch) => ({
        id: branch.id,
        label: branch.name,
      })) ?? [];

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
      <Controller
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={branchOptions}
            value={branchOptions.find((o) => o.id === field.value) ?? null}
            onChange={(_, option) => field.onChange(option?.id ?? "")}
            renderInput={(params) => (
              // @ts-expect-error fixme: exactOptionalPropertyTypes
              <TextField {...params} label="Tilhører" />
            )}
          />
        )}
        name={"parentBranch"}
      />
      <TextField
        label={"Delt inn i"}
        {...register("childLabel")}
        helperText={"f.eks. årskull, klasse, parallell"}
      ></TextField>
      <Controller
        name="childBranches"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <Autocomplete
            limitTags={3}
            multiple
            options={branchOptions}
            value={branchOptions.filter((o) => field.value.includes(o.id))}
            onChange={(_, options) => field.onChange(options.map((o) => o.id))}
            renderInput={(params) => (
              // @ts-expect-error fixme: exactOptionalPropertyTypes
              <TextField {...params} label="Består av" />
            )}
            filterSelectedOptions
          />
        )}
      />
    </>
  );
}
