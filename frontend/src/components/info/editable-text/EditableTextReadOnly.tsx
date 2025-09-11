"use client";
import { no } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useQuery } from "@tanstack/react-query";

import useApiClient from "@/hooks/useApiClient";

export default function EditableTextReadOnly({
  dataKey,
  cachedText,
}: {
  dataKey: string;
  cachedText: string;
}) {
  const client = useApiClient();

  const { data } = useQuery({
    queryKey: [client.editable_texts.key({ key: dataKey }).$url(), dataKey],
    queryFn: () => client.editable_texts.key({ key: dataKey }).$get().unwrap(),
  });

  const editor = useCreateBlockNote({
    dictionary: no,
    initialContent: JSON.parse(data?.text ?? cachedText),
  });

  return <BlockNoteView editor={editor} editable={false} theme={"light"} />;
}
