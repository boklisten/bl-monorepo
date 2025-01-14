import { BlCollection } from "@backend/collections/bl-collection";
import { EditableTextModel } from "@backend/collections/editable-text/editable-text.model";
import { EditableTextPutHook } from "@backend/collections/editable-text/hooks/editable-text.put.hook";

export const EditableTextCollection: BlCollection = {
  model: EditableTextModel,
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
