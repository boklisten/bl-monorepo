import { Textarea, TextareaProps } from "@mantine/core";

import { useFieldContext } from "@/hooks/form";

export default function TextAreaField(props: TextareaProps) {
  const field = useFieldContext<string>();
  return (
    <Textarea
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
