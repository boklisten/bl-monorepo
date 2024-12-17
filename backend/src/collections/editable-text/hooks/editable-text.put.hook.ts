import { BlError, EditableText } from "@boklisten/bl-model";

import { Hook } from "@/hook/hook";

export class EditableTextPutHook extends Hook {
  // Our PUT implementation resets creationTime, but it shouldn't matter for this use case
  override async before(
    body: unknown,
    _accessToken: never,
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    candidate["text"] != null &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof candidate["text"] === "string"
  );
}
