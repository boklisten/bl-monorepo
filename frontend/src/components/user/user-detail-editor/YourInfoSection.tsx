import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Controller, useFormContext } from "react-hook-form";

import ClassMembershipSelect from "@/components/ClassMembershipSelect";
import DatePickerField from "@/components/user/fields/DatePickerField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import PostalCodeField from "@/components/user/fields/PostalCodeField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function YourInfoSection({
  onIsUnderageChange,
  variant,
}: {
  onIsUnderageChange: (isUnderage: boolean | null) => void;
  variant: UserDetailsEditorVariant;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UserEditorFields>();

  return (
    <>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
        sx={{
          mt: 1,
        }}
      >
        <Typography variant="body1">
          {variant === "administrate" ? "Kundens" : "Din"} informasjon
        </Typography>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          required
          autoComplete="name"
          fullWidth
          id="name"
          label="Fullt navn"
          error={!!errors.name}
          {...register("name", fieldValidators.name)}
        />
        <FieldErrorAlert field={"name"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PhoneNumberField
          error={!!errors.phoneNumber}
          {...register("phoneNumber", fieldValidators.phoneNumber)}
        />
        <FieldErrorAlert field={"phoneNumber"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          required
          fullWidth
          id="address"
          label="Adresse"
          autoComplete="street-address"
          error={!!errors.address}
          {...register("address", fieldValidators.address)}
        />
        <FieldErrorAlert field={"address"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PostalCodeField />
        <FieldErrorAlert field={"postalCode"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DatePickerField
          handleChange={onIsUnderageChange}
          control={control}
          {...register("birthday", fieldValidators.birthday)}
        />
        <FieldErrorAlert field={"birthday"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          control={control}
          render={({ field }) => (
            <ClassMembershipSelect
              error={!!errors.branchMembership}
              branchMembership={field.value}
              onChange={(selectedBranchId) => field.onChange(selectedBranchId)}
            />
          )}
          name={"branchMembership"}
        />
        <FieldErrorAlert field={"branchMembership"} />
      </Grid>
    </>
  );
}
