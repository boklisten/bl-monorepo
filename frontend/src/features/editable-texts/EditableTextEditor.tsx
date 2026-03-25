import type { EditableText } from "@boklisten/backend/shared/editable-text";
import { Button, Group, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export default function EditableTextEditor({
  editableText,
  onClose,
}: {
  editableText?: EditableText | undefined;
  onClose: () => void;
}) {
  const form = useAppForm({
    defaultValues: {
      key: editableText?.key ?? "",
      text: editableText?.text ?? "",
    },
    onSubmit: ({ value }) => {
      if (editableText === undefined) {
        addEditableTextMutation.mutate({
          body: {
            key: value.key,
            text: value.text,
          },
        });
      } else {
        updateEditableTextMutation.mutate({
          params: { id: editableText.id },
          body: {
            key: editableText.key,
            text: value.text,
          },
        });
      }
    },
  });

  const queryClient = useQueryClient();
  const { api } = useApiClient();

  const addEditableTextMutation = useMutation(
    api.editableTexts.store.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: api.editableTexts.getAll.pathKey(),
        }),
      onSuccess: () => {
        showSuccessNotification("Dynamisk innhold ble opprettet!");
        onClose();
      },
      onError: () =>
        showErrorNotification({
          title: "Klarte ikke opprette dynamisk innhold!",
          message:
            'Vennligst sjekk at unik nøkkel er formattert riktig. [a-z] og "_" for mellomrom.',
        }),
    }),
  );

  const updateEditableTextMutation = useMutation(
    api.editableTexts.update.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: api.editableTexts.getAll.pathKey(),
        }),
      onSuccess: () => {
        showSuccessNotification("Dynamisk innhold ble oppdatert!");
        onClose();
      },
      onError: () => showErrorNotification("Klarte ikke oppdatere dynamisk innhold!"),
    }),
  );

  return (
    <Stack>
      <form.AppField
        name={"key"}
        validators={{
          onChange: ({ value }) => (value.length === 0 ? "Du fylle inn unik nøkkel" : null),
        }}
      >
        {(field) => (
          <field.TextField
            label={"Unik nøkkel"}
            description={"Unik nøkkel kan ikke endres etter opprettelse"}
            placeholder={"min_nye_nokkel"}
            disabled={editableText !== undefined}
          />
        )}
      </form.AppField>
      <form.AppField name={"text"}>
        {(field) => <field.RichTextEditorField label={"Tekst"} />}
      </form.AppField>
      <Group>
        <Button variant={"subtle"} onClick={() => onClose()}>
          Avbryt
        </Button>
        <Button
          loading={addEditableTextMutation.isPending || updateEditableTextMutation.isPending}
          onClick={form.handleSubmit}
        >
          {editableText === undefined ? "Opprett" : "Lagre"}
        </Button>
      </Group>
    </Stack>
  );
}
