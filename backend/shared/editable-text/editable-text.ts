import { BlDocument } from "#shared/bl-document/bl-document";

export interface EditableText extends BlDocument {
  key: string;
  text: string;
}
