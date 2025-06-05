import router from "@adonisjs/core/services/router";

import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";

const AuthTokensController = () =>
  import("#controllers/auth/tokens_controller");
const AuthSocialController = () =>
  import("#controllers/auth/social_controller");
const AuthLocalController = () => import("#controllers/auth/local_controller");
const WaitingListEntriesController = () =>
  import("#controllers/waiting_list_entries_controller");
const RemindersController = () => import("#controllers/reminders_controller");
const BranchesController = () => import("#controllers/branches_controller");
const MailTemplateSenderController = () =>
  import("#controllers/mail_template_sender_controller");

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

/**
 * reminders
 */
router
  .post("/reminders/count_recipients", [RemindersController, "countRecipients"])
  .as("reminders.count_recipients");
router
  .post("/reminders/send", [RemindersController, "remind"])
  .as("reminders.send");

/**
 * branches
 */
router.post("/v2/branches", [BranchesController, "add"]).as("branches.add");
router
  .patch("/v2/branches/:id", [BranchesController, "update"])
  .as("branches.update");
router
  .post("/v2/branches/memberships", [BranchesController, "uploadMemberships"])
  .as("branches.addMemberships");

/**
 * mail template sender
 */

router
  .post("/emails/send", [MailTemplateSenderController, "sendEmails"])
  .as("emails.send");

CollectionEndpointCreator.generateEndpoints();
