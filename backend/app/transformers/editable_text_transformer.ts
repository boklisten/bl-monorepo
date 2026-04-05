import { BaseTransformer } from "@adonisjs/core/transformers";
import EditableText from "#models/editable_text";

export default class EditableTextTransformer extends BaseTransformer<EditableText> {
  toObject() {
    return this.pick(this.resource, ["id", "text"]);
  }
}
