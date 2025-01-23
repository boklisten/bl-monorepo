import CollectionEndpoint from "@backend/express/collection-endpoint/collection-endpoint.js";
import BlCollections from "@backend/express/collections/bl-collections.js";
import { Router } from "express";

export function createRouter() {
  const router: Router = Router();
  for (const collection of BlCollections) {
    for (const endpoint of collection.endpoints) {
      CollectionEndpoint.create(router, endpoint, collection);
    }
  }
  return router;
}

const CollectionEndpointCreator = {
  createRouter,
};
export default CollectionEndpointCreator;
