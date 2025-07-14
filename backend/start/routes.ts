import router from "@adonisjs/core/services/router";

import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";

const AuthTokensController = () =>
  import("#controllers/auth/tokens_controller");
const AuthSocialController = () =>
  import("#controllers/auth/social_controller");
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
const UserDetailsController = () =>
  import("#controllers/user_details_controller");
const EditableTextsController = () =>
  import("#controllers/editable_texts_controller");
const QuestionsAndAnswersController = () =>
  import("#controllers/questions_and_answers_controller");

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

/**
 * password reset
 */
router
  .post("/forgot-password", [AuthPasswordResetController, "forgotPasswordSend"])
  .as("auth.password.forgot.send");
router
  .post("/reset-password", [AuthPasswordResetController, "resetPasswordStore"])
  .as("auth.password.reset.store");

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
 * user details
 */
router
  .post("/v2/userdetails/check_phone_number_already_registered", [
    UserDetailsController,
    "checkPhoneNumberAlreadyRegistered",
  ])
  .as("userdetails.checkPhoneNumberAlreadyRegistered");

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

CollectionEndpointCreator.generateEndpoints();
