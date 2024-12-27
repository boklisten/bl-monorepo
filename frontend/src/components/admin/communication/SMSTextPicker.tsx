import { TextField } from "@mui/material";
import { useState } from "react";

const SMS_MAX_SINGLE_SEGMENT_LENGTH = 160;
const SMS_MAX_MULTIPLE_SEGMENT_LENGTH = 153;

export default function SMSTextPicker({
  onChange,
}: {
  onChange: (smsText: string | null) => void;
}) {
  const [charCountText, setCharCountText] = useState<string>("");
  function updateTextLength(text: string): void {
    const length = text.length;
    if (length <= SMS_MAX_SINGLE_SEGMENT_LENGTH) {
      const extraChars =
        length === SMS_MAX_SINGLE_SEGMENT_LENGTH
          ? SMS_MAX_SINGLE_SEGMENT_LENGTH
          : length % SMS_MAX_SINGLE_SEGMENT_LENGTH;
      setCharCountText(
        `1 segment, ${extraChars}/${SMS_MAX_SINGLE_SEGMENT_LENGTH} til neste`,
      );
    } else {
      const segments = Math.ceil(length / SMS_MAX_MULTIPLE_SEGMENT_LENGTH);
      const extraChars = length % SMS_MAX_MULTIPLE_SEGMENT_LENGTH;
      setCharCountText(
        `${segments} segmenter, ${extraChars}/${SMS_MAX_MULTIPLE_SEGMENT_LENGTH} til neste`,
      );
    }
  }

  return (
    <TextField
      helperText={charCountText}
      color={"primary"}
      multiline
      label={"Melding"}
      onChange={(event) => {
        onChange(event.target.value);
        updateTextLength(event.target.value);
      }}
    />
  );
}
