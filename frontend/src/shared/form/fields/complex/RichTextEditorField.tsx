// The toolbar icons are as of writing buggy with React Compiler. Might be possible to remove this in the future
"use no memo";
import { Stack, Text } from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { useFieldContext } from "@/shared/form/hooks";

export default function RichTextEditorField(props: { label: string }) {
  const field = useFieldContext<string>();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: field.state.value,
    onUpdate: ({ editor }) => {
      field.handleChange(editor.getHTML());
    },
    onBlur: field.handleBlur,
  });

  return (
    <Stack gap={3}>
      <Text size="sm" fw={500}>
        {props.label}
      </Text>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </Stack>
  );
}
