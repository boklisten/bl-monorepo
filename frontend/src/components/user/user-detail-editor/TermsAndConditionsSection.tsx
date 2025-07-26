import { Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import { useFormContext } from "react-hook-form";

import DynamicLink from "@/components/DynamicLink";
import FieldErrorAlert from "@/components/user/fields/FieldErrorAlert";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function TermsAndConditionsSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserEditorFields>();
  return (
    <Grid size={{ xs: 12 }}>
      <FormControlLabel
        control={
          <Checkbox
            sx={{
              color: errors.agreeToTermsAndConditions ? "red" : "inherit",
            }}
            {...register(
              "agreeToTermsAndConditions",
              fieldValidators.agreeToTermsAndConditions,
            )}
          />
        }
        label={
          <Typography>
            {"Jeg godtar Boklistens "}
            <DynamicLink
              href={"/info/policies/conditions"}
              target={"_blank"}
              variant={"body1"}
              underline={"hover"}
            >
              betingelser
            </DynamicLink>
            {" og "}
            <DynamicLink
              href={"/info/policies/terms"}
              target={"_blank"}
              variant={"body1"}
              underline={"hover"}
            >
              vilkår
            </DynamicLink>{" "}
            *
          </Typography>
        }
      />
      <FieldErrorAlert field={"agreeToTermsAndConditions"} />
    </Grid>
  );
}
