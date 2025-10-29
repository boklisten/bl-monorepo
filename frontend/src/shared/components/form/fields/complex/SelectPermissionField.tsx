import { Select, SelectProps } from "@mantine/core";

import { useFieldContext } from "@/shared/hooks/form";

export default function SelectPermissionField(props: SelectProps) {
  const field = useFieldContext<string | null>();
  return (
    <Select
      label={"Tilgang"}
      placeholder={"Velg tilgang"}
      required
      data={[
        { value: "customer", label: "kunde" },
        { value: "employee", label: "ansatt" },
        { value: "manager", label: "manager" },
        { value: "admin", label: "administrator" },
      ]}
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
