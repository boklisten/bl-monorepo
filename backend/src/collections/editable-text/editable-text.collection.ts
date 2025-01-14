import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { editableTextSchema } from "@backend/collections/editable-text/editable-text.schema";
import { EditableTextPutHook } from "@backend/collections/editable-text/hooks/editable-text.put.hook";

export const EditableTextCollection: BlCollection = {
  collectionName: BlCollectionName.EditableTexts,
  mongooseSchema: editableTextSchema,
  endpoints: [
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
  ],
};
