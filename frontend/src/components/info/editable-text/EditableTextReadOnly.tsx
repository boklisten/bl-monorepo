"use client";
import { RichTextEditor } from "@mantine/tiptap";
import { useQuery } from "@tanstack/react-query";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

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

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit],
    content: text,
  });

  if (!text) {
    return (
      <InfoAlert title={"Oisann, her var det tomt..."}>
        Innholdet du ser etter er ikke publisert enda. Ta kontakt dersom du har
        spørsmål.
      </InfoAlert>
    );
  }

  return (
    <RichTextEditor editor={editor} style={{ border: "none" }}>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
