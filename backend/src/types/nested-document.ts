import { BlStorageHandler } from "@backend/express/storage/bl-storage.js";

export interface NestedDocument {
  field: string;
  storage: BlStorageHandler;
}
