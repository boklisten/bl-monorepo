"use client";
import { Button, Container } from "@mui/material";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { isAdmin } from "@/api/auth";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  { ssr: false },
);

const sanitizeRawState = (raw: string) => {
  return raw.replaceAll("\n", String.raw`\n`);
};

const getEditorStateFromRaw = (rawState: string) => {
  try {
    return EditorState.createWithContent(
      convertFromRaw(JSON.parse(sanitizeRawState(rawState))),
    );
  } catch (error) {
    console.error(error);
    return EditorState.createEmpty();
  }
};

const CustomEditor = ({ rawEditorState }: { rawEditorState: string }) => {
  const initialEditorState = rawEditorState
    ? getEditorStateFromRaw(rawEditorState)
    : EditorState.createEmpty();

  const [editorState, setEditorState] = useState(initialEditorState);

  const rawState = JSON.stringify(
    convertToRaw(editorState.getCurrentContent()),
  );

  const [readOnly, setReadOnly] = useState(true);

  const onEditorStateChange = (changedState: EditorState) => {
    setEditorState(changedState);
  };

  const onSave = () => {
    console.log(rawState);
    setReadOnly(!readOnly);
  };

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Container
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {hydrated && isAdmin() && (
        <Button
          sx={{ width: { xs: "100%", sm: "" }, paddingX: 5 }}
          onClick={onSave}
        >
          {readOnly ? "Rediger" : "Lagre"}
        </Button>
      )}
      <Editor
        editorState={editorState}
        toolbarHidden={!isAdmin() || readOnly}
        onEditorStateChange={onEditorStateChange}
        readOnly={!isAdmin() || readOnly}
        wrapperStyle={{ width: "100%" }}
      />
    </Container>
  );
};

export default CustomEditor;
