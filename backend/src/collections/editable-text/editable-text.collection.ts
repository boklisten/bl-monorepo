import { BlCollection } from "@backend/collections/bl-collection.js";
import { EditableTextPutHook } from "@backend/collections/editable-text/hooks/editable-text.put.hook.js";
import { BlStorage } from "@backend/storage/bl-storage.js";

export const EditableTextCollection: BlCollection = {
  storage: BlStorage.EditableTexts,
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
        permission: "admin",
      },
    },
    {
      method: "delete",
      restriction: {
        permission: "admin",
      },
    },
  ],
};
