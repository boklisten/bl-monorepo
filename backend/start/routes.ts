import router from "@adonisjs/core/services/router";

import CollectionEndpointCreator from "#services/legacy/collection-endpoint/collection-endpoint-creator";

const AuthTokensController = () =>
  import("#controllers/auth/tokens_controller");
const AuthSocialController = () =>
  import("#controllers/auth/social_controller");
const AuthVippsController = () => import("#controllers/auth/vipps_controller");
const AuthLocalController = () => import("#controllers/auth/local_controller");
const AuthPasswordResetController = () =>
  import("#controllers/auth/password_reset_controller");
const WaitingListEntriesController = () =>
  import("#controllers/waiting_list_entries_controller");
const RemindersController = () => import("#controllers/reminders_controller");
const BranchesController = () => import("#controllers/branches_controller");
const MailTemplateSenderController = () =>
  import("#controllers/mail_template_sender_controller");
const OrdersController = () => import("#controllers/orders_controller");
const EditableTextsController = () =>
  import("#controllers/editable_texts_controller");
const QuestionsAndAnswersController = () =>
  import("#controllers/questions_and_answers_controller");
const EmailValidationsController = () =>
  import("#controllers/email_validations_controller");
const PublicBlidLookupController = () =>
  import("#controllers/public_blid_lookup_controller");
const MatchesController = () =>
  import("#controllers/matches/matches_controller");
const UserDetailController = () =>
  import("#controllers/user_detail_controller");
const CustomerItemsController = () =>
  import("#controllers/customer_items_controller");

/**
 * auth token
 */
router
  .post("/token", [AuthTokensController, "legacyToken"])
  .as("auth.legacyToken");
router.post("/v2/token", [AuthTokensController, "token"]).as("v2.auth.token");

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
 * auth vipps
 */
router
  .get("/v2/auth/vipps/callback", [AuthVippsController, "callback"])
  .as("auth.vipps.callback");

/**
 * auth local
 */
router
  .post("/auth/local/login", [AuthLocalController, "login"])
  .as("auth.local.login");
router
  .post("/auth/local/register", [AuthLocalController, "register"])
  .as("auth.local.register");

/**
 * password reset
 */
router
  .post("/forgot_password", [
    AuthPasswordResetController,
    "requestPasswordReset",
  ])
  .as("auth.password.forgot");
router
  .post("/reset_password/validate", [
    AuthPasswordResetController,
    "validatePasswordReset",
  ])
  .as("auth.password.reset.validate");
router
  .post("/reset_password", [AuthPasswordResetController, "resetPassword"])
  .as("auth.password.reset");

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
router
  .post("/v2/branches/subject_choices", [
    BranchesController,
    "uploadSubjectChoices",
  ])
  .as("branches.addSubjectChoices");

/**
 * mail template sender
 */
router
  .post("/emails/send", [MailTemplateSenderController, "sendEmails"])
  .as("emails.send");

/**
 * orders
 */
router
  .get("/v2/orders/open_orders", [OrdersController, "getOpenOrders"])
  .as("open_orders.get");
router
  .post("/v2/orders/cancel_order_item", [OrdersController, "cancelOrderItem"])
  .as("open_orders.cancel");

/**
 * editable texts
 */
router
  .get("/editable_texts", [EditableTextsController, "getAll"])
  .as("editable_texts.getAll");
router
  .get("/editable_texts/key/:key", [EditableTextsController, "getByKey"])
  .as("editable_texts.getByKey");
router
  .post("/editable_texts", [EditableTextsController, "store"])
  .as("editable_texts.store");
router
  .patch("/editable_texts/:id", [EditableTextsController, "update"])
  .as("editable_texts.update");
router
  .delete("/editable_texts/:id", [EditableTextsController, "destroy"])
  .as("editable_texts.destroy");

/**
 * questions and answers
 */
router
  .get("/questions_and_answers", [QuestionsAndAnswersController, "getAll"])
  .as("questions_and_answers.getAll");
router
  .post("/questions_and_answers", [QuestionsAndAnswersController, "store"])
  .as("questions_and_answers.store");
router
  .patch("/questions_and_answers/:id", [
    QuestionsAndAnswersController,
    "update",
  ])
  .as("questions_and_answers.update");
router
  .delete("/questions_and_answers/:id", [
    QuestionsAndAnswersController,
    "destroy",
  ])
  .as("questions_and_answers.destroy");

/**
 * email validations
 */
router
  .post("/email_validations", [EmailValidationsController, "create"])
  .as("email_validations.create");
router
  .get("/email_validations/:id", [EmailValidationsController, "confirm"])
  .as("email_validations.confirm");

/**
 * public blid lookup
 */
router
  .get("/public_blid_lookup/:blid", [PublicBlidLookupController, "lookup"])
  .as("blid.lookup");

/**
 * matches
 */
router
  .post("/matches/generate", [MatchesController, "generate"])
  .as("matches.generate");
router
  .post("/matches/notify", [MatchesController, "notify"])
  .as("matches.notify");
router
  .post("/user_matches/lock", [MatchesController, "lock"])
  .as("matches.lock");
router.get("/matches/me", [MatchesController, "getMyMatches"]).as("matches.me");
router
  .post("/matches/transfer_item", [MatchesController, "transferItem"])
  .as("matches.transfer_item");

/**
 * user detail
 */
router
  .post("/v2/user_details", [UserDetailController, "updateAsCustomer"])
  .as("user_detail.updateAsCustomer");

/**
 * customer items
 */
router
  .get("/v2/customer_items", [CustomerItemsController, "getCustomerItems"])
  .as("customer_items.get");

CollectionEndpointCreator.generateEndpoints();
