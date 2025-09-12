import { Anchor } from "@mantine/core";
import { Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { useFormContext } from "react-hook-form";

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
            <Anchor
              component={Link}
              href={"/info/policies/conditions"}
              target={"_blank"}
            >
              betingelser
            </Anchor>
            {" og "}
            <Anchor
              component={Link}
              href={"/info/policies/terms"}
              target={"_blank"}
            >
              vilkår
            </Anchor>{" "}
            *
          </Typography>
        }
      />
      <FieldErrorAlert field={"agreeToTermsAndConditions"} />
    </Grid>
  );
}
