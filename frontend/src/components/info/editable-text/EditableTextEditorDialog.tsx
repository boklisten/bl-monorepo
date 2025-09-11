"use client";
import { EditableText } from "@boklisten/backend/shared/editable-text";
import { ContextModalProps } from "@mantine/modals";
import { Button, Stack, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RichTextEditorRef } from "mui-tiptap";
import { useRef, useState } from "react";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function EditableTextEditorDialog({
  context,
  id,
  innerProps: { editableText },
}: ContextModalProps<{
  editableText?: EditableText | undefined;
}>) {
  const [key, setKey] = useState(editableText?.key ?? "");
  const rteRef = useRef<RichTextEditorRef>(null);

  const queryClient = useQueryClient();
  const client = useApiClient();

  const addEditableTextMutation = useMutation({
    mutationFn: (editableText: { text: string; key: string }) =>
      client.editable_texts.$post(editableText).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.editable_texts.$url()],
      }),
    onSuccess: () => {
      showSuccessNotification("Dynamisk innhold ble opprettet!");
      context.closeModal(id);
    },
    onError: () =>
      showErrorNotification({
        title: "Klarte ikke opprette dynamisk innhold!",
        message:
          'Vennligst sjekk at unik nøkkel er formattert riktig. [a-z] og "_" for mellomrom.',
      }),
  });

  const updateEditableTextMutation = useMutation({
    mutationFn: (editableText: { id: string; text: string }) =>
      client
        .editable_texts({ id: editableText.id })
        .$patch({ text: editableText.text })
        .unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.editable_texts.$url()],
      }),
    onSuccess: () => {
      showSuccessNotification("Dynamisk innhold ble oppdatert!");
      context.closeModal(id);
    },
    onError: () =>
      showErrorNotification("Klarte ikke oppdatere dynamisk innhold!"),
  });

  async function handleSubmit() {
    if (editableText === undefined) {
      addEditableTextMutation.mutate({
        text: rteRef.current?.editor?.getHTML() ?? "",
        key: key ?? "",
      });
    } else {
      updateEditableTextMutation.mutate({
        id: editableText.id,
        text: rteRef.current?.editor?.getHTML() ?? "",
      });
    }
  }

  return (
    <>
      <Stack gap={2} mt={1}>
        <TextField
          label={"Unik nøkkel"}
          placeholder={"min_nye_nokkel"}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          disabled={editableText !== undefined}
          helperText={"Unik nøkkel kan ikke endres etter opprettelse"}
        />
        <TextEditor content={editableText?.text ?? ""} rteRef={rteRef} />
      </Stack>
      <Button onClick={() => context.closeModal(id)}>Avbryt</Button>
      <Button
        loading={
          addEditableTextMutation.isPending ||
          updateEditableTextMutation.isPending
        }
        onClick={handleSubmit}
      >
        {editableText === undefined ? "Opprett" : "Lagre"}
      </Button>
    </>
  );
}
