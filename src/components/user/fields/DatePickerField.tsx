import { DatePickerProps } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers";
import { Moment } from "moment";
import moment from "moment/moment";
import { forwardRef, Ref } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

type DatePickerFieldProps<T extends FieldValues> = DatePickerProps<Moment> & {
  name: FieldPath<T>;
  control: Control<T>;
  handleChange: (value: Moment | null) => void;
};

const DatePickerField = forwardRef(
  // @ts-expect-error type should be fixed
  <T extends FieldValues>(
    { control, name, handleChange, ...props }: DatePickerFieldProps<T>,
    ref: Ref<HTMLInputElement>,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange: updateForm, onBlur, ...field },
        fieldState: { error },
      }) => (
        <DatePicker
          {...field}
          sx={{ width: "100%" }}
          label="Fødselsdato *"
          format="DD/MM/YYYY"
          minDate={moment().subtract(100, "years")}
          maxDate={moment().subtract(10, "years")}
          openTo="year"
          views={["year", "month", "day"]}
          onClose={onBlur}
          slotProps={{
            field: { onBlur },
            textField: {
              onBlur,
              error: !!error,
              helperText: error?.message,
              name,
            },
          }}
          // Adding ref gives a warning, so don't
          ref={undefined}
          inputRef={ref}
          {...props}
          // Must be below ...props to override onChange
          onChange={(value) => {
            updateForm(value);
            handleChange(value);
          }}
          onAccept={(value) => {
            updateForm(value);
            handleChange(value);
          }}
        />
      )}
    />
  ),
);
DatePickerField.displayName = "DatePickerField";

export default DatePickerField;
