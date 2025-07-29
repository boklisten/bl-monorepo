import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useFormContext } from "react-hook-form";

import EmailField from "@/components/user/fields/EmailField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function GuardianInfoSection({
  variant,
}: {
  variant: UserDetailsEditorVariant;
}) {
  const {
    register,
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
          Siden {variant === "administrate" ? "kunden" : "du"} er under 18,
          trenger vi informasjon om en av{" "}
          {variant === "administrate" ? "kundens" : "dine"} foresatte.
        </Typography>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          required
          fullWidth
          id="lastName"
          label="Foresatt sitt fulle navn"
          autoComplete="name"
          error={!!errors.guardianName}
          {...register("guardianName", fieldValidators.guardianName)}
        />
        <FieldErrorAlert field={"guardianName"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EmailField
          label="Foresatt sin e-post"
          error={!!errors.guardianEmail}
          {...register("guardianEmail", fieldValidators.guardianEmail)}
        />
        <FieldErrorAlert field={"guardianEmail"} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PhoneNumberField
          id="guardianPhoneNumber"
          label="Foresatt sitt telefonnummer"
          error={!!errors.guardianPhoneNumber}
          {...register(
            "guardianPhoneNumber",
            fieldValidators.guardianPhoneNumber,
          )}
        />
        <FieldErrorAlert field={"guardianPhoneNumber"} />
      </Grid>
    </>
  );
}
