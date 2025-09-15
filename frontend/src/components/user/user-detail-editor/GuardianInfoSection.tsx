import { Divider, Stack, Text } from "@mantine/core";
import TextField from "@mui/material/TextField";
import { useFormContext } from "react-hook-form";

import EmailField from "@/components/user/fields/EmailField";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function GuardianInfoSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserEditorFields>();
  return (
    <>
      <Stack gap={"xs"}>
        <Text>
          Siden du er under 18, trenger vi informasjon om en av dine foresatte.
        </Text>
        <Divider />
      </Stack>
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
      <EmailField label="Foresatt sin e-post" field={"guardianEmail"} />
      <FieldErrorAlert field={"guardianEmail"} />
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
    </>
  );
}
