import { MessageMethod } from "@boklisten/backend/shared/src/message/message-method/message-method";
import { Box, Typography } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

export default function MessageMethodPicker({
  onChange,
}: {
  onChange: (selectedMessageMethod: MessageMethod | null) => void;
}) {
  const [messageMethod, setMessageMethod] = useState<string | null>(null);
  return (
    <Box>
      <Typography variant={"h5"} sx={{ mb: 1 }}>
        Meldingstype
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={messageMethod}
        exclusive
        onChange={(_, newMessageMethod) => {
          onChange(newMessageMethod);
          setMessageMethod(newMessageMethod);
        }}
      >
        <ToggleButton value={MessageMethod.SMS}>SMS</ToggleButton>
        <ToggleButton value={MessageMethod.EMAIL}>E-post</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
