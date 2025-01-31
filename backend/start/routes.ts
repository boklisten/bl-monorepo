import router from "@adonisjs/core/services/router";

import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";
import { middleware } from "#start/kernel";

const AuthTokensController = () =>
  import("#controllers/auth/tokens_controller");
const AuthSocialController = () =>
  import("#controllers/auth/social_controller");
const AuthLocalController = () => import("#controllers/auth/local_controller");
const WaitingListEntriesController = () =>
  import("#controllers/waiting_list_entries_controller");

/**
 * auth token
 */
router.post("/token", [AuthTokensController, "token"]).as("auth.token");

/**
 * auth social
 */
router
  .get("/auth/:provider/redirect", [AuthSocialController, "redirect"])
  .as("auth.social.redirect");
router
  .get("/auth/:provider/callback", [AuthSocialController, "callback"])
  .as("auth.social.callback");

/**
 * auth local
 */
router
  .post("/auth/local/login", [AuthLocalController, "login"])
  .as("auth.local.login");
router
  .post("/auth/local/register", [AuthLocalController, "register"])
  .as("auth.local.register");

router
  .get("/waiting_list_entries", [
    WaitingListEntriesController,
    "getAllWaitingListEntries",
  ])
  .use(middleware.superjson())
  .as("waiting_list_entries.getAll");
router
  .post("/waiting_list_entries", [
    WaitingListEntriesController,
    "addWaitingListEntry",
  ])
  .as("waiting_list_entries.add");
router
  .delete("/waiting_list_entries/:id", [
    WaitingListEntriesController,
    "deleteWaitingListEntry",
  ])
  .as("waiting_list_entries.delete");

CollectionEndpointCreator.generateEndpoints();
