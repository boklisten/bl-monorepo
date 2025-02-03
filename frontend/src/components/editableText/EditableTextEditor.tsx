import "react-quill/dist/quill.snow.css";

import { Box, Button, Container, styled } from "@mui/material";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";

import BlFetcher from "@/api/blFetcher";
import { EditorProps } from "@/components/editableText/EditableTextElement";
import { EditableTextRenderer } from "@/components/editableText/EditableTextRenderer";
import useApiClient from "@/utils/api/useApiClient";
import useExitInterceptor from "@/utils/useExitInterceptor";

const Quill = styled(
  dynamic<ReactQuill.ReactQuillProps>(import("react-quill"), { ssr: false }),
)({});

export const EditableTextEditor = ({ editableText }: EditorProps) => {
  const client = useApiClient();
  const initialValue = editableText.text ?? "";

  const editorState = useRef<string>(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  const [readOnly, setReadOnly] = useState(true);

  useExitInterceptor(!readOnly);

  const onEdit = () => {
    setReadOnly(false);
  };

  const onEditorSave = async () => {
    // fixme: implement persistent storage of editable text
  };

  const onSave = () => {
    setReadOnly(true);
    if (editorRef.current?.innerText.trim().length === 0) {
      editorState.current = "";
    }

    BlFetcher.put(
      client.$url("collection.editabletexts.put", {
        params: { id: editableText.id },
      }),
      {
        ...editableText,
        text: editorState.current,
      },
    )
      .then(async () => {
        await onEditorSave();
        return;
      })
      .catch((error) => {
        throw new Error("Failed to save editable text", { cause: error });
      });
  };

  const onCancel = () => {
    editorState.current = initialValue;
    setReadOnly(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        padding: 0,
      }}
      data-testid="editor"
    >
      {readOnly ? (
        <Button data-testid="edit-button" onClick={onEdit}>
          Rediger
        </Button>
      ) : (
        <Container
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <Button
            data-testid="cancel-button"
            onClick={onCancel}
            color="warning"
            variant="outlined"
          >
            Avbryt
          </Button>
          <Button
            data-testid="save-button"
            onClick={onSave}
            variant="contained"
          >
            Lagre
          </Button>
        </Container>
      )}
      <Container
        ref={editorRef}
        sx={{
          display: readOnly ? "none" : undefined,
        }}
      >
        <Quill
          formats={quillFormats}
          modules={quillModules}
          placeholder="Rediger meg ..."
          defaultValue={initialValue}
          onChange={(changedState) => {
            editorState.current = changedState;
          }}
          sx={{
            width: "100%",
            "& .ql-editor": {
              minHeight: "10em",
            },
          }}
        />
      </Container>
      {readOnly && <EditableTextRenderer editableText={editableText} />}
    </Box>
  );
};

const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { header: "3" }],
    // Disabled until bl-web no longer needs to be supported
    // [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link"],
    // Disabled until bl-web no longer needs to be supported
    // [{ align: [] }],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const quillFormats = [
  "header",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
];
