"use client";
import { useQuery } from "@tanstack/react-query";

import InfoAlert from "@/components/ui/alerts/InfoAlert";
import RichTextEditorReadOnly from "@/components/ui/RichTextEditorReadOnly";
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

  if (!text) {
    return (
      <InfoAlert title={"Oisann, her var det tomt..."}>
        Innholdet du ser etter er ikke publisert enda. Ta kontakt dersom du har
        spørsmål.
      </InfoAlert>
    );
  }

  return <RichTextEditorReadOnly content={text} />;
}
