import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method.js";
import { BlApiRequest } from "@backend/request/bl-api-request.js";
import { BlStorageData } from "@backend/storage/bl-storage.js";

export interface CollectionEndpointOnRequest extends CollectionEndpointMethod {
  onRequest(blApiRequest: BlApiRequest): Promise<BlStorageData>;
}
