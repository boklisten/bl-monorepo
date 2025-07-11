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
import { Link } from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { DialogProps, useNotifications } from "@toolpad/core";
import {
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  MenuButtonBold,
  MenuButtonEditLink,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  RichTextEditorRef,
  TableBubbleMenu,
} from "mui-tiptap";
import { useRef, useState } from "react";

import useApiClient from "@/utils/api/useApiClient";

export const richTextEditorExtensions = [
  StarterKit,
  Link,
  LinkBubbleMenuHandler,
];

export default function EditableTextEditorDialog({
  payload,
  open,
  onClose,
}: DialogProps<EditableText | undefined>) {
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(payload?.key);
  const rteRef = useRef<RichTextEditorRef>(null);
  const notifications = useNotifications();

  const queryClient = useQueryClient();
  const client = useApiClient();
  const addEditableTextMutation = useMutation({
    mutationFn: async (editableText: { text: string; key: string }) => {
      setIsLoading(true);
      return await client.editable_texts.$post(editableText).unwrap();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [client.editable_texts.$url()],
      });
      setIsLoading(false);
    },
    onSuccess: async () => {
      notifications.show("Dynamisk innhold ble opprettet!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      await onClose();
    },
    onError: async () => {
      notifications.show("Klarte ikke opprette dynamisk innhold!", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
  });

  const updateEditableTextMutation = useMutation({
    mutationFn: async (editableText: { id: string; text: string }) => {
      setIsLoading(true);
      return await client
        .editable_texts({ id: editableText.id })
        .$patch({ text: editableText.text })
        .unwrap();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [client.editable_texts.$url()],
      });
      setIsLoading(false);
    },
    onSuccess: async () => {
      notifications.show("Dynamisk innhold ble oppdatert!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      await onClose();
    },
    onError: async () => {
      notifications.show("Klarte ikke oppdatere dynamisk innhold!", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
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
            label={"Nøkkel"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={payload !== undefined}
            helperText={"Nøkkel kan ikke endres etter opprettelse"}
          />
          <RichTextEditor
            ref={rteRef}
            extensions={richTextEditorExtensions}
            content={payload?.text ?? ""}
            renderControls={() => (
              <MenuControlsContainer>
                <MenuSelectHeading />
                <MenuDivider />
                <MenuButtonBold />
                <MenuButtonItalic />
                <MenuDivider />
                <MenuButtonEditLink />
                <MenuDivider />
              </MenuControlsContainer>
            )}
          >
            {() => (
              <>
                <LinkBubbleMenu />
                <TableBubbleMenu />
              </>
            )}
          </RichTextEditor>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Avbryt</Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          {payload === undefined ? "Opprett" : "Lagre"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
