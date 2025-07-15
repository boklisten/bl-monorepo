"use client";
import { EditableText } from "@boklisten/backend/shared/editable-text/editable-text";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DialogProps, useNotifications } from "@toolpad/core";
import { RichTextEditorRef } from "mui-tiptap";
import { useRef, useState } from "react";

import { TextEditor } from "@/components/TextEditor";
import useApiClient from "@/utils/api/useApiClient";

export default function EditableTextEditorDialog({
  payload,
  open,
  onClose,
}: DialogProps<EditableText | undefined>) {
  const [key, setKey] = useState(payload?.key ?? "");
  const rteRef = useRef<RichTextEditorRef>(null);
  const notifications = useNotifications();

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
      notifications.show("Dynamisk innhold ble opprettet!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      onClose();
    },
    onError: () =>
      notifications.show(
        `Klarte ikke opprette dynamisk innhold! Vennligst sjekk at unik nøkkel er formattert riktig. [a-z] og "_" for mellomrom.`,
        {
          severity: "error",
          autoHideDuration: 5000,
        },
      ),
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
      notifications.show("Dynamisk innhold ble oppdatert!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      onClose();
    },
    onError: () =>
      notifications.show("Klarte ikke oppdatere dynamisk innhold!", {
        severity: "error",
        autoHideDuration: 5000,
      }),
  });

  async function handleSubmit() {
    if (payload === undefined) {
      addEditableTextMutation.mutate({
        text: rteRef.current?.editor?.getHTML() ?? "",
        key: key ?? "",
      });
    } else {
      updateEditableTextMutation.mutate({
        id: payload.id,
        text: rteRef.current?.editor?.getHTML() ?? "",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      slotProps={{
        paper: {
          sx: {
            width: 800,
            maxWidth: "90%",
          },
        },
      }}
    >
      <DialogTitle>
        {payload === undefined ? "Opprett" : "Rediger"} innhold
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} mt={1}>
          <TextField
            label={"Unik nøkkel"}
            placeholder={"min_nye_nokkel"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={payload !== undefined}
            helperText={"Unik nøkkel kan ikke endres etter opprettelse"}
          />
          <TextEditor content={payload?.text ?? ""} rteRef={rteRef} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Avbryt</Button>
        <Button
          loading={
            addEditableTextMutation.isPending ||
            updateEditableTextMutation.isPending
          }
          onClick={handleSubmit}
        >
          {payload === undefined ? "Opprett" : "Lagre"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
