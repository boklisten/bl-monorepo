import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";

export default function BranchAutocomplete({
  label,
  branches,
  onChange,
}: {
  label: string;
  branches: Branch[];
  onChange: (branchId: string | null) => void;
}) {
  return (
    <Autocomplete
      /** @ts-expect-error --exactOptionalPropertyTypes not supported by MUI */
      renderInput={(params) => <TextField {...params} label={label} />}
      options={branches.map((branch) => ({
        id: branch.id,
        label: branch.name,
      }))}
      onChange={(_, selected) => onChange(selected?.id ?? null)}
    />
  );
}
