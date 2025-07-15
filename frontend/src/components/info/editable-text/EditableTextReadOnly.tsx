"use client";
import { Alert, AlertTitle, Container, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/utils/api/useApiClient";

export default function EditableTextReadOnly({
  dataKey,
  cachedText,
}: {
  dataKey: string;
  cachedText?: string;
}) {
  const client = useApiClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      client.$url("editable_texts.getByKey", { params: { key: dataKey } }),
    ],
    queryFn: () => client.editable_texts.key({ key: dataKey }).$get().unwrap(),
  });

  const content = data?.text ?? cachedText;

  if (isLoading && content === undefined) {
    return (
      <Container>
        <Skeleton sx={{ mb: 1 }} width={250} height={40} />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton sx={{ mt: 3, mb: 1 }} width={250} height={40} />
        <Skeleton />
        <Skeleton />
        <Skeleton sx={{ mt: 3, mb: 1 }} width={250} height={40} />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Container>
    );
  }

  if (isError || content === undefined) {
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
      <TextEditor readOnly content={content} />
    </Container>
  );
}
