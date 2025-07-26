import { Alert } from "@mui/material";
import { useFormContext } from "react-hook-form";

import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailEditor";

export default function FieldErrorAlert({
  field,
}: {
  field: keyof UserEditorFields;
}) {
  const { formState } = useFormContext<UserEditorFields>();
  const error = formState.errors[field];
  if (!error) return null;
  return (
    <Alert key={error.type} severity="error" sx={{ my: 1 }}>
      {error.message}
    </Alert>
  );
}
