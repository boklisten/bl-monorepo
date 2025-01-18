import { BlStorageHandler } from "@backend/storage/bl-storage";

export interface NestedDocument {
  field: string;
  storage: BlStorageHandler;
}
