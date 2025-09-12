"use client";
// IMPORTANT: keep this outside of global.css to avoid overwriting globals
import "@blocknote/mantine/style.css";

import { no } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useQuery } from "@tanstack/react-query";

import InfoAlert from "@/components/ui/alerts/InfoAlert";
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
  const text = data?.text ?? cachedText;

  const editor = useCreateBlockNote({
    dictionary: no,
    initialContent: text ? JSON.parse(text) : null,
  });

  if (!text) {
    return (
      <InfoAlert title={"Oisann, her var det tomt..."}>
        Innholdet du ser etter er ikke publisert enda. Ta kontakt dersom du har
        spørsmål.
      </InfoAlert>
    );
  }

  return <BlockNoteView editor={editor} editable={false} theme={"light"} />;
}
