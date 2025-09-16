"use client";

import { Spoiler } from "@mantine/core";

import EditableTextReadOnly from "@/features/editable-text/EditableTextReadOnly";

export default function ExpandableEditableTextReadOnly({
  dataKey,
  cachedText,
  collapsedSize = 165,
}: {
  dataKey: string;
  cachedText: string;
  collapsedSize?: number;
}) {
  return (
    <Spoiler
      maxHeight={collapsedSize}
      showLabel={"Vis mer"}
      hideLabel={"Vis mindre"}
    >
      <EditableTextReadOnly dataKey={dataKey} cachedText={cachedText} />
    </Spoiler>
  );
}
