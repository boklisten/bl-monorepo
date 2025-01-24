import { Hook } from "@backend/lib/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class EditableTextPutHook extends Hook {
    // Our PUT implementation resets creationTime, but it shouldn't matter for this use case
    async before(body, accessToken, id) {
        if (!validateEditableText(body)) {
            throw new BlError("Invalid EditableTextPatch request body").code(701);
        }
        return { id, text: body.text };
    }
}
export function validateEditableText(candidate) {
    return (candidate != null &&
        // @ts-expect-error fixme: auto ignored
        candidate["text"] != null &&
        // @ts-expect-error fixme: auto ignored
        typeof candidate["text"] === "string");
}
