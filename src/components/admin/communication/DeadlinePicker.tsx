import { Box, Grid2, Typography } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { DatePicker } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import { useState } from "react";

function calculateDeadlineOptions() {
  const today = new Date();
  const summerDeadline = new Date(today.getFullYear(), 6, 1);
  const winterDeadline = new Date(today.getFullYear(), 11, 20);
  // Continue to show the deadline for a month afterward, with warning
  const summerDeadlinePlusGracePeriod = new Date(
    summerDeadline.getFullYear(),
    7,
    1,
  );
  const winterDeadlinePlusGracePeriod = new Date(
    winterDeadline.getFullYear() + 1,
    0,
    20,
  );

  if (today > summerDeadlinePlusGracePeriod) {
    summerDeadline.setFullYear(today.getFullYear() + 1);
  }
  if (today > winterDeadlinePlusGracePeriod) {
    winterDeadline.setFullYear(today.getFullYear() + 1);
  }

  let usualDates = [summerDeadline, winterDeadline];
  if (summerDeadline > winterDeadline) {
    usualDates = [winterDeadline, summerDeadline];
  }

  return usualDates;
}

export default function DeadlinePicker({
  onChange,
}: {
  onChange: (selectedDeadline: Date | null) => void;
}) {
  const [datePickerValue, setDatePickerValue] = useState<Moment | null>(null);
  const [deadlineToggleValue, setDeadlineToggleValue] = useState<string | null>(
    null,
  );
  return (
    <Box>
      <Typography variant={"h5"} sx={{ mb: 1 }}>
        Frist
      </Typography>
      <Grid2 container spacing={1.75} direction="column">
        <ToggleButtonGroup
          color="primary"
          value={String(deadlineToggleValue)}
          exclusive
          onChange={(_, newDeadline) => {
            onChange(
              newDeadline === "custom"
                ? datePickerValue?.isValid()
                  ? datePickerValue.toDate()
                  : null
                : newDeadline,
            );
            setDeadlineToggleValue(newDeadline);
          }}
        >
          {calculateDeadlineOptions().map((option) => (
            <ToggleButton value={option.toString()} key={option.toString()}>
              {moment(option).format("DD/MM/yyyy")}
            </ToggleButton>
          ))}
          <ToggleButton value="custom">Egendefinert</ToggleButton>
        </ToggleButtonGroup>
        {deadlineToggleValue === "custom" && (
          <DatePicker
            format={"DD/MM/YYYY"}
            sx={{ width: 318 }}
            minDate={moment().subtract(1, "month")}
            maxDate={moment().add(5, "years")}
            label={"Velg frist"}
            value={datePickerValue}
            onChange={(newDeadline) => {
              onChange(newDeadline?.isValid() ? newDeadline.toDate() : null);
              setDatePickerValue(newDeadline);
            }}
          />
        )}
      </Grid2>
    </Box>
  );
}
