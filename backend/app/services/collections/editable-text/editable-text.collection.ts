import { EditableTextPutHook } from "#services/collections/editable-text/hooks/editable-text.put.hook";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
