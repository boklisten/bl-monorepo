import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method.js";
import { BlStorageData } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";

export interface CollectionEndpointOnRequest extends CollectionEndpointMethod {
  onRequest(blApiRequest: BlApiRequest): Promise<BlStorageData>;
}
