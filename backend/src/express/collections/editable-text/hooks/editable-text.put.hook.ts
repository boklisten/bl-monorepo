import { Hook } from "@backend/express/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { EditableText } from "@shared/editable-text/editable-text.js";

export class EditableTextPutHook extends Hook {
  // Our PUT implementation resets creationTime, but it shouldn't matter for this use case
  override async before(
    body: unknown,
    accessToken: never,
    id: string,
  ): Promise<EditableText> {
    if (!validateEditableText(body)) {
      throw new BlError("Invalid EditableTextPatch request body").code(701);
    }
    return { id, text: body.text };
  }
}

export function validateEditableText(
  candidate: unknown,
): candidate is EditableText {
  return (
    candidate != null &&
    // @ts-expect-error fixme: auto ignored
    candidate["text"] != null &&
    // @ts-expect-error fixme: auto ignored
    typeof candidate["text"] === "string"
  );
}
