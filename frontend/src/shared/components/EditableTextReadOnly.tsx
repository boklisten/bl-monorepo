import { useQuery } from "@tanstack/react-query";

import InfoAlert from "@/shared/components/alerts/InfoAlert";
import RichTextEditorReadOnly from "@/shared/components/RichTextEditorReadOnly";
import { Skeleton, Stack } from "@mantine/core";
import { publicApi } from "@/shared/utils/publicApiClient";

export default function EditableTextReadOnly({ dataKey }: { dataKey: string }) {
  const { data, isLoading } = useQuery(
    publicApi.editableTexts.getByKey.queryOptions({ params: { key: dataKey } }),
  );

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
