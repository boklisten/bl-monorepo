import { CustomerItemType } from "@boklisten/bl-model";
import { Box, Typography } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

export default function CustomerItemTypePicker({
  onChange,
}: {
  onChange: (selectedCustomerItemType: CustomerItemType | null) => void;
}) {
  const [customerItemType, setCustomerItemType] = useState<string | null>(null);
  return (
    <Box>
      <Typography variant={"h5"} sx={{ mb: 1 }}>
        Kundetype
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={customerItemType}
        exclusive
        onChange={(_, newCustomerItemType) => {
          onChange(newCustomerItemType);
          setCustomerItemType(newCustomerItemType);
        }}
      >
        <ToggleButton value={"rent"}>VGS</ToggleButton>
        <ToggleButton value={"partly-payment"}>Privatist</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
