/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import CollectionsController from "@backend/app/controllers/collections/collections_controller.js";
import configureMongoose from "@backend/config/database.js";

await configureMongoose();

CollectionsController.generateEndpoints();
