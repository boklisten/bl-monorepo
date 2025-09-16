import { SegmentedControlProps } from "@mantine/core";

import { useFieldContext } from "@/shared/form/hooks";
import SegmentedControlWithLabel from "@/shared/ui/components/SegmentedControlWithLabel";

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
