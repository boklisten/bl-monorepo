"use client";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/utils/api/useApiClient";

export default function EditableTextReadOnly({
  dataKey,
  cachedText,
}: {
  dataKey: string;
  cachedText: string;
}) {
  const client = useApiClient();

  const { data, isError } = useQuery({
    queryKey: [client.editable_texts.key({ key: dataKey }).$url(), dataKey],
    queryFn: () => client.editable_texts.key({ key: dataKey }).$get().unwrap(),
  });

  const content = data?.text ?? cachedText;

  if (isError || content === undefined) {
    return (
      <Alert color="red" title={"Klarte ikke laste inn dynamisk innhold"}>
        Du kan prøve å laste inn siden på nytt, eller ta kontakt dersom
        problemet vedvarer.
      </Alert>
    );
  }

  return <TextEditor readOnly content={content} />;
}
