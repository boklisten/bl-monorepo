import { Check, Info } from "@mui/icons-material";
import { InputAdornment, Tooltip } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormContext, useWatch } from "react-hook-form";

import { fieldValidators } from "@/components/user/user-detail-editor/fieldValidators";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function EmailField({
  label = "E-post",
  disabled = false,
  helperText = "",
  field = "email",
}: {
  label?: string;
  disabled?: boolean;
  helperText?: string;
  field?: "email" | "guardianEmail";
}) {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<UserEditorFields>();
  const isEmailVerified = useWatch({ control, name: "emailVerified" });
  return (
    <TextField
      label={label}
      required
      fullWidth
      id="email"
      autoComplete="email"
      disabled={disabled}
      helperText={helperText}
      slotProps={{
        htmlInput: {
          inputMode: "email",
        },
        input: {
          endAdornment: (
            <>
              {isEmailVerified !== undefined && (
                <InputAdornment position={"end"}>
                  <Tooltip
                    title={isEmailVerified ? "Bekreftet" : "Ikke bekreftet"}
                  >
                    {isEmailVerified ? (
                      <Check color={"success"} />
                    ) : (
                      <Info color={"warning"} />
                    )}
                  </Tooltip>
                </InputAdornment>
              )}
            </>
          ),
        },
      }}
      error={field === "email" ? !!errors.email : !!errors.guardianEmail}
      {...register(
        field,
        field === "email"
          ? fieldValidators.email
          : fieldValidators.guardianEmail,
      )}
    />
  );
}
