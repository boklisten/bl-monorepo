import { Branch } from "@boklisten/backend/shared/branch";
import { Stack } from "@mantine/core";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { Controller, useFormContext } from "react-hook-form";

import { BranchCreateForm } from "@/components/branches/BranchSettings";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";

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

  const { control } = useFormContext<BranchCreateForm>();

  const branchOptions =
    branches
      ?.filter((branch) => branch.id !== currentBranchId)
      .map((branch) => ({
        id: branch.id,
        label: branch.name,
      })) ?? [];

  return (
    <Stack>
      <Controller
        name={"name"}
        control={control}
        render={({ field }) => (
          <TextField
            required
            label={"Fullt navn"}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        name={"localName"}
        control={control}
        render={({ field }) => (
          <TextField
            required
            label={"Lokalt navn"}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        name={"parentBranch"}
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
      />
      <Controller
        name={"childLabel"}
        control={control}
        render={({ field }) => (
          <TextField
            required
            label={"Delt inn i"}
            helperText={"f.eks. årskull, klasse, parallell"}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
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
    </Stack>
  );
}
