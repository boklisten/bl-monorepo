import { useFormContext } from "react-hook-form";

import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function FieldErrorAlert({
  field,
}: {
  field: keyof UserEditorFields;
}) {
  const { formState } = useFormContext<UserEditorFields>();
  const error = formState.errors[field];
  if (!error) return null;
  return <ErrorAlert key={error.type}>{error.message}</ErrorAlert>;
}
