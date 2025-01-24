import { EditableTextPutHook } from "@backend/lib/collections/editable-text/hooks/editable-text.put.hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const EditableTextCollection = {
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
