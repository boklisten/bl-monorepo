import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

export default function RichTextEditorReadOnly({ content }: { content: string }) {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit.configure({ link: false }), Link],
    content,
  });

  return (
    <RichTextEditor editor={editor} style={{ border: "none" }}>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
