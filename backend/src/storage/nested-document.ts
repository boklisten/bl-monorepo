import { BlStorageHandler } from "@backend/storage/bl-storage.js";

export interface NestedDocument {
  field: string;
  storage: BlStorageHandler;
}
