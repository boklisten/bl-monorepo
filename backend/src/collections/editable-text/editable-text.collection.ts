import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@/collections/bl-collection";
import { editableTextSchema } from "@/collections/editable-text/editable-text.schema";
import { EditableTextPutHook } from "@/collections/editable-text/hooks/editable-text.put.hook";

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
        permissions: ["admin", "super"],
      },
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
  ];
}
