import { Text, TextInput, TextInputProps } from "@mantine/core";
import isMobilePhone from "validator/lib/isMobilePhone";

import { useFieldContext } from "@/hooks/form";

export function phoneNumberFieldValidator(
  value: string,
  context: "personal" | "guardian" | "administrate" | string,
  primaryPhoneNumber?: string,
) {
  if (!value) {
    if (context === "personal" || context === "administrate")
      return "Du må fylle inn telefonnummer";
    if (context === "guardian")
      return "Du må fylle inn foresatt sitt telefonnummer";
  }

  if (
    !isMobilePhone(value, "nb-NO") ||
    value.length !== 8 ||
    value.includes("+47")
  ) {
    if (context === "personal" || context === "administrate")
      return "Du må fylle inn et gyldig norsk telefonnummer (8 tall uten mellomrom og +47)";
    if (context === "guardian")
      return "Du må fylle inn et gyldig norsk telefonnummer for foresatt (8 tall uten mellomrom og +47)";
  }

  if (context === "guardian" && value === primaryPhoneNumber)
    return `Foresatt sitt telefonnummer må være forskjellig fra kontoens telefonnummer (${primaryPhoneNumber})`;

  return null;
}

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
