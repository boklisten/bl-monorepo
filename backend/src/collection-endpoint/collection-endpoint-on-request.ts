import { CollectionEndpointMethod } from "@backend/collection-endpoint/collection-endpoint-method";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlStorageData } from "@backend/storage/bl-storage";

export interface CollectionEndpointOnRequest extends CollectionEndpointMethod {
  onRequest(blApiRequest: BlApiRequest): Promise<BlStorageData>;
}
