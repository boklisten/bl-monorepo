import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { editableTextSchema } from "@backend/collections/editable-text/editable-text.schema";
import { EditableTextPutHook } from "@backend/collections/editable-text/hooks/editable-text.put.hook";

export class EditableTextCollection implements BlCollection {
  public collectionName = BlCollectionName.EditableTexts;
  public mongooseSchema = editableTextSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "getId",
    },
    {
      method: "getAll",
    },
    {
      method: "put",
      hook: new EditableTextPutHook(),
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin"],
      },
    },
  ];
}
