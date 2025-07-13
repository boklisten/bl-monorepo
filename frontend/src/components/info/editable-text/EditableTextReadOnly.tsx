"use client";
import { Alert, AlertTitle, Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/utils/api/useApiClient";

export default function EditableTextReadOnly({ dataKey }: { dataKey: string }) {
  const client = useApiClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      client.$url("editable_texts.getByKey", { params: { key: dataKey } }),
    ],
    queryFn: () => client.editable_texts.key({ key: dataKey }).$get().unwrap(),
  });
  if (isLoading) {
    return;
  }
  if (isError || !data) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Klarte ikke laste inn dynamisk innhold</AlertTitle>
          Du kan prøve å laste inn siden på nytt, eller ta kontakt dersom
          problemet vedvarer.
        </Alert>
      </Container>
    );
  }
  return (
    <Container>
      <TextEditor readOnly content={data.text} />
    </Container>
  );
}
