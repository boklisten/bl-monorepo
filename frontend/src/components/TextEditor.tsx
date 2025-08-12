import { Extensions } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
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
  RichTextReadOnly,
  TableBubbleMenu,
} from "mui-tiptap";
import { Ref } from "react";

const richTextEditorExtensions = [
  StarterKit,
  LinkBubbleMenuHandler,
] as const satisfies Extensions;

type TextEditorProps =
  | {
      readOnly: true;
      content: string;
    }
  | { readOnly?: false; content: string; rteRef: Ref<RichTextEditorRef> };

export function TextEditor(props: TextEditorProps) {
  return props.readOnly ? (
    <RichTextReadOnly
      immediatelyRender={false}
      content={props.content}
      extensions={richTextEditorExtensions}
    />
  ) : (
    <RichTextEditor
      immediatelyRender={false}
      ref={props.rteRef}
      extensions={richTextEditorExtensions}
      content={props.content}
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
  );
}
