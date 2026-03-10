import { useQuery } from "@tanstack/react-query";

import InfoAlert from "@/shared/components/alerts/InfoAlert";
import RichTextEditorReadOnly from "@/shared/components/RichTextEditorReadOnly";
import useApiClient from "@/shared/hooks/useApiClient";
import { Skeleton, Stack } from "@mantine/core";

export default function EditableTextReadOnly({ dataKey }: { dataKey: string }) {
  const client = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: [client.editable_texts.key({ key: dataKey }).$url(), dataKey],
    queryFn: () => client.editable_texts.key({ key: dataKey }).$get().unwrap(),
  });

  if (isLoading)
    return (
      <Stack>
        <Skeleton h={30} w={400} />
        <Skeleton h={200} w={800} />
        <Skeleton h={200} w={800} />
      </Stack>
    );

  if (!data || !data.text) {
    return (
      <InfoAlert title={"Oisann, her var det tomt..."}>
        Innholdet du ser etter er ikke publisert enda. Ta kontakt dersom du har spørsmål.
      </InfoAlert>
    );
  }

  return <RichTextEditorReadOnly content={data.text} />;
}
