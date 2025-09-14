import { Text, TextInput, TextInputProps } from "@mantine/core";

import { useFieldContext } from "@/hooks/form";

export default function PhoneNumberField(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      required
      label={"Telefonnummer"}
      placeholder={"98765432"}
      autoComplete={"tel-national"}
      inputMode={"numeric"}
      leftSection={
        <Text size={"sm"} c={"dimmed"}>
          +47
        </Text>
      }
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
