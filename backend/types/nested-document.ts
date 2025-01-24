import { BlStorageHandler } from "@backend/lib/storage/bl-storage.js";

export interface NestedDocument {
  field: string;
  storage: BlStorageHandler;
}
