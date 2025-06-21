import { Alert } from "@mui/material";
import { FieldError } from "react-hook-form";

export default function FieldErrorAlert({
  error,
}: {
  error: FieldError | undefined;
}) {
  if (!error) return null;
  return (
    <Alert key={error.type} severity="error" sx={{ my: 1 }}>
      {error.message}
    </Alert>
  );
}
