import { SENDGRID_TEMPLATE_ID_REGEX } from "@boklisten/backend/app/validators/send_grid_template_id_validator";
import { TextField } from "@mui/material";
import { useState } from "react";

export default function EmailTemplatePicker({
  onChange,
}: {
  onChange: (emailTemplateId: string | null) => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <TextField
      error={errorMessage !== null}
      helperText={errorMessage}
      color={"primary"}
      label={"Template ID"}
      placeholder={"d-123456789"}
      onBlur={(event) => {
        const text = event.target.value;
        if (SENDGRID_TEMPLATE_ID_REGEX.test(text)) {
          setErrorMessage(null);
        } else {
          setErrorMessage("Du må skrive inn en gyldig SendGrid Template ID");
        }
      }}
      onChange={(event) => {
        const text = event.target.value;
        if (SENDGRID_TEMPLATE_ID_REGEX.test(text)) {
          onChange(text);
          return;
        }
        onChange(null);
      }}
    />
  );
}
