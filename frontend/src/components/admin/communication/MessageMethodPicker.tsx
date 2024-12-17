import { Box, Typography } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { MessageMethod } from "@shared/message/message-method/message-method";
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
        sx={{ display: "flex", justifyContent: "right" }}
        color="primary"
        value={messageMethod}
        exclusive
        onChange={(_, newMessageMethod) => {
          onChange(newMessageMethod);
          setMessageMethod(newMessageMethod);
        }}
      >
        <ToggleButton value={"sms"}>SMS</ToggleButton>
        <ToggleButton value={"email"}>E-post</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
