import { SegmentedControlProps } from "@mantine/core";

import SegmentedControlWithLabel from "@/components/ui/SegmentedControlWithLabel";
import { useFieldContext } from "@/hooks/form";

export default function SegmentedControlField(
  props: SegmentedControlProps & { label: string },
) {
  const field = useFieldContext<string>();
  return (
    <SegmentedControlWithLabel
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
    />
  );
}
