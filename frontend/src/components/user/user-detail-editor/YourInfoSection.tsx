import { Divider, Stack, Text } from "@mantine/core";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { Controller, useFormContext } from "react-hook-form";

import ClassMembershipSelect from "@/components/ClassMembershipSelect";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import PostalCodeField from "@/components/user/fields/PostalCodeField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function YourInfoSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UserEditorFields>();

  return (
    <>
      <Stack gap={"xs"}>
        <Text>Din informasjon</Text>
        <Divider />
      </Stack>
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
      <PhoneNumberField
        error={!!errors.phoneNumber}
        {...register("phoneNumber", fieldValidators.phoneNumber)}
      />
      <FieldErrorAlert field={"phoneNumber"} />
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
      <PostalCodeField />
      <FieldErrorAlert field={"postalCode"} />
      <Controller
        name={"birthday"}
        control={control}
        rules={fieldValidators.birthday}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            {...field}
            sx={{ width: "100%" }}
            label="Fødselsdato *"
            format="DD/MM/YYYY"
            minDate={moment().subtract(100, "years")}
            maxDate={moment().subtract(10, "years")}
            openTo="year"
            views={["year", "month", "day"]}
            slotProps={{
              textField: {
                error: !!error,
              },
            }}
          />
        )}
      />
      <FieldErrorAlert field={"birthday"} />
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
    </>
  );
}
