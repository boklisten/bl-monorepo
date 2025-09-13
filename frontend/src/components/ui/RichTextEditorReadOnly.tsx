import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

export default function RichTextEditorReadOnly({
  content,
}: {
  content: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit],
    content,
  });

  return (
    <RichTextEditor editor={editor} style={{ border: "none" }}>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
