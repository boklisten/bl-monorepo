import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import {
  Control,
  FieldError,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

import DatePickerField from "@/components/user/fields/DatePickerField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import PostalCodeField, {
  PostalCityState,
} from "@/components/user/fields/PostalCodeField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/useUserDetailEditorForm";

interface YourInfoSectionProps {
  errors: FieldErrors<UserEditorFields>;
  postCity: PostalCityState;
  updatePostalCity: (newPostalCode: string) => void;
  onIsUnderageChange: (isUnderage: boolean | null) => void;
  control: Control<UserEditorFields>;
  register: UseFormRegister<UserEditorFields>;
}

const YourInfoSection = ({
  register,
  errors,
  postCity,
  updatePostalCity,
  onIsUnderageChange,
  control,
}: YourInfoSectionProps) => (
  <>
    <Grid
      item
      xs={12}
      sm={12}
      sx={{
        mt: 1,
      }}
    >
      <Typography variant="body1">Din informasjon</Typography>
      <Divider />
    </Grid>
    <Grid item xs={12}>
      <TextField
        data-testid="name-field"
        required
        autoComplete="name"
        fullWidth
        id="name"
        label="Fullt navn"
        error={!!errors.name}
        {...register("name", fieldValidators.name)}
      />
      <FieldErrorAlert error={errors.name} />
    </Grid>
    <Grid item xs={12}>
      <PhoneNumberField
        error={!!errors.phoneNumber}
        {...register("phoneNumber", fieldValidators.phoneNumber)}
      />
      <FieldErrorAlert error={errors.phoneNumber} />
    </Grid>
    <Grid item xs={12}>
      <TextField
        data-testid="address-field"
        required
        fullWidth
        id="address"
        label="Adresse"
        autoComplete="street-address"
        error={!!errors.address}
        {...register("address", fieldValidators.address)}
      />
      <FieldErrorAlert error={errors.address} />
    </Grid>
    <Grid item xs={12}>
      <PostalCodeField
        error={!!errors.postalCode}
        postCity={postCity}
        updatePostalCity={updatePostalCity}
        {...register("postalCode", {
          ...fieldValidators.postalCode,
        })}
      />
      <FieldErrorAlert error={errors.postalCode} />
    </Grid>
    <Grid item xs={12}>
      <DatePickerField
        handleChange={onIsUnderageChange}
        control={control}
        {...register("birthday", fieldValidators.birthday)}
      />
      <FieldErrorAlert error={errors.birthday as FieldError} />
    </Grid>
  </>
);

export default YourInfoSection;
