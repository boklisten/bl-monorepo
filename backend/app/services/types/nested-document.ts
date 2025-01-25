import { BlStorageHandler } from "#services/storage/bl-storage";

export interface NestedDocument {
  field: string;
  storage: BlStorageHandler;
}
