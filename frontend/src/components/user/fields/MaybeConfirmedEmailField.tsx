import { Check, Info } from "@mui/icons-material";
import { InputAdornment, Tooltip } from "@mui/material";
import { useFormContext } from "react-hook-form";

import EmailField from "@/components/user/fields/EmailField";
import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import {
  UserDetailsEditorVariant,
  UserEditorFields,
} from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function MaybeConfirmedEmailField({
  variant,
  isEmailConfirmed,
}: {
  variant: UserDetailsEditorVariant;
  isEmailConfirmed: boolean | undefined;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserEditorFields>();
  return (
    <EmailField
      InputProps={{
        endAdornment: (
          <>
            {variant !== "signup" && (
              <InputAdornment position={"end"}>
                <Tooltip
                  title={isEmailConfirmed ? "Bekreftet" : "Ikke bekreftet"}
                >
                  {isEmailConfirmed ? (
                    <Check color={"success"} />
                  ) : (
                    <Info color={"warning"} />
                  )}
                </Tooltip>
              </InputAdornment>
            )}
          </>
        ),
      }}
      disabled={variant === "personal" || variant === "administrate"} // fixme: enable in administrate but note that we also need to update the users table
      helperText={
        variant === "personal"
          ? "Ta kontakt dersom du ønsker å endre e-postadresse"
          : ""
      }
      error={!!errors.email}
      {...register("email", fieldValidators.email)}
    />
  );
}
