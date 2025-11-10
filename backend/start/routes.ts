import router from "@adonisjs/core/services/router";

import CollectionEndpoint from "#services/legacy/collection-endpoint/collection-endpoint";
import BlCollections from "#services/legacy/collections/bl-collections";

const AuthTokensController = () =>
  import("#controllers/auth/tokens_controller");
const AuthVippsController = () => import("#controllers/auth/vipps_controller");
const AuthLocalController = () => import("#controllers/auth/local_controller");
const AuthPasswordResetController = () =>
  import("#controllers/auth/password_reset_controller");
const WaitingListEntriesController = () =>
  import("#controllers/waiting_list_entries_controller");
const RemindersController = () => import("#controllers/reminders_controller");
const BranchesController = () =>
  import("#controllers/branches/branches_controller");
const BranchUploadController = () =>
  import("#controllers/branches/branch_upload_controller");
const BranchRelationshipController = () =>
  import("#controllers/branches/branch_relationship_controller");
const BranchMembershipController = () =>
  import("#controllers/branches/branch_membership_controller");
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
const SignaturesController = () => import("#controllers/signatures_controller");
const UniqueIdsController = () => import("#controllers/unique_ids_controller");
const UserProvisioningController = () =>
  import("#controllers/user_provisioning_controller");
const UniqueItemsController = () =>
  import("#controllers/unique_items_controller");
const OrderHistoryController = () =>
  import("#controllers/order_history_controller");
const CheckoutController = () => import("#controllers/checkout_controller");
const SubjectsController = () => import("#controllers/subjects_controller");
const BranchItemsController = () =>
  import("#controllers/branch_items_controller");
const PostalController = () => import("#controllers/postal_controller");
const CompaniesController = () => import("#controllers/companies_controller");
const OpeningHoursController = () =>
  import("#controllers/opening_hours_controller");
const ItemsController = () => import("#controllers/items_controller");
const DispatchController = () => import("#controllers/dispatch_controller");

/**
 * static
 */

router.get("/", () => {
  return {};
});

/**
 * auth token
 */
router
  .post("/token", [AuthTokensController, "legacyToken"])
  .as("auth.legacyToken");
router.post("/v2/token", [AuthTokensController, "token"]).as("v2.auth.token");

/**
 * auth vipps
 */
router
  .get("/auth/vipps/redirect", [AuthVippsController, "redirect"])
  .as("auth.vipps.redirect");
router
  .get("/auth/vipps/callback", [AuthVippsController, "callback"])
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
  .patch("/v2/branches", [BranchesController, "update"])
  .as("branches.update");

/**
 * branch upload
 */
router
  .post("/v2/branches/memberships", [
    BranchUploadController,
    "uploadMemberships",
  ])
  .as("branches.addMemberships");
router
  .post("/v2/branches/subject_choices", [
    BranchUploadController,
    "uploadSubjectChoices",
  ])
  .as("branches.addSubjectChoices");

/**
 * branch relationships
 */
router
  .patch("/v2/branches/relationships", [BranchRelationshipController, "update"])
  .as("branches.relationships.update");

/**
 * branch memberships
 */
router
  .get("/v2/branches/memberships/:branchId", [
    BranchMembershipController,
    "getMembers",
  ])
  .as("branches.memberships.get");
router
  .patch("/branches/memberships", [
    BranchMembershipController,
    "updateMembership",
  ])
  .as("branches.memberships.update");
router
  .delete("/branches/memberships/direct/:branchId", [
    BranchMembershipController,
    "removeDirectMembers",
  ])
  .as("branches.memberships.remove.direct");
router
  .delete("/branches/memberships/indirect/:branchId", [
    BranchMembershipController,
    "removeIndirectMembers",
  ])
  .as("branches.memberships.remove.indirect");

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
router
  .get("/matches/me", [MatchesController, "getMyMatches"])
  .as("matches.getMyMatches");
router
  .post("/matches/transfer_item", [MatchesController, "transferItem"])
  .as("matches.transfer_item");

/**
 * user detail
 */
router
  .get("/v2/user_details/id/:detailsId", [UserDetailController, "getById"])
  .as("user_detail.getById");
router
  .get("/v2/user_details/me", [UserDetailController, "getMyDetails"])
  .as("user_detail.getMyDetails");
router
  .post("/v2/user_details", [UserDetailController, "updateAsCustomer"])
  .as("user_detail.updateAsCustomer");
router
  .post("/v2/employee/user_details/:detailsId", [
    UserDetailController,
    "updateAsEmployee",
  ])
  .as("user_detail.updateAsEmployee");

/**
 * customer items
 */
router
  .get("/v2/customer_items", [CustomerItemsController, "getCustomerItems"])
  .as("customer_items.get");

/**
 * signatures
 */
router
  .post("/signatures/send/:detailsId", [
    SignaturesController,
    "sendSignatureLink",
  ])
  .as("signatures.send.link");
router
  .post("/signatures/me/send", [
    SignaturesController,
    "sendSignatureLinkAsCustomer",
  ])
  .as("signatures.me.send");
router
  .get("/signatures/valid/:detailsId", [
    SignaturesController,
    "hasValidSignature",
  ])
  .as("signatures.valid");
router
  .get("/signatures/get/:detailsId", [SignaturesController, "getSignature"])
  .as("signatures.get");
router
  .post("/signatures/sign/:detailsId", [SignaturesController, "sign"])
  .as("signatures.sign");

/**
 * Unique Ids
 */
router
  .get("/unique_ids/token", [UniqueIdsController, "getToken"])
  .as("unique_ids.token");
router
  .get("/unique_ids/download_pdf/:token", [
    UniqueIdsController,
    "downloadUniqueIdPdf",
  ])
  .as("unique_ids.download.pdf");

/**
 * User Provisioning
 */
router
  .post("/users/create", [UserProvisioningController, "createUsers"])
  .as("users.create");

/**
 * Unique Items
 */
router
  .post("/unique_items/add", [UniqueItemsController, "add"])
  .as("unique_items.add");

/**
 * Order History
 */

router
  .get("/order_history/me/:orderId", [OrderHistoryController, "getMyOrder"])
  .as("order_history.get.my.order");
router
  .get("/order_history/me", [OrderHistoryController, "getMyOrders"])
  .as("order_history.get.my.orders");

/**
 * Checkout
 */
router
  .post("/checkout", [CheckoutController, "initializeCheckout"])
  .as("checkout.initialize");
router
  .post("/checkout/confirm/:orderId", [CheckoutController, "confirmCheckout"])
  .as("checkout.confirm");
router
  .post("/checkout/vipps/callback", [CheckoutController, "handleVippsCallback"])
  .as("checkout.vipps.callback");
router
  .get("/checkout/poll/:orderId", [CheckoutController, "pollPayment"])
  .as("checkout.poll");

/**
 * Subjects
 */
router
  .get("/subjects/:branchId", [SubjectsController, "getBranchSubjects"])
  .as("subjects.get.branch.subjects");
router
  .get("/branch_items/:branchId", [BranchItemsController, "getBranchItems"])
  .as("branch_items.get");
router
  .post("/branch_items", [BranchItemsController, "setBranchItems"])
  .as("branch_items.post");

/**
 * Postal
 */
router
  .get("/postal/lookup/postal_code/:postalCode", [
    PostalController,
    "lookupPostalCode",
  ])
  .as("lookup.postal.code");

/**
 * Companies
 */
router
  .get("/v2/companies", [CompaniesController, "getCompanies"])
  .as("companies.get");
router
  .post("/v2/companies", [CompaniesController, "addCompany"])
  .as("companies.add");
router
  .delete("/v2/companies/:companyId", [CompaniesController, "deleteCompany"])
  .as("companies.delete");

/**
 * Opening Hours
 */
router
  .get("/v2/opening_hours/:id", [OpeningHoursController, "get"])
  .as("opening_hours.get");
router
  .post("/v2/opening_hours", [OpeningHoursController, "add"])
  .as("opening_hours.add");
router
  .delete("/v2/opening_hours/:id", [OpeningHoursController, "delete"])
  .as("opening_hours.delete");

/**
 * Items
 */
router.get("/v2/items", [ItemsController, "get"]).as("items.get");

/**
 * Dispatch
 */
router
  .get("/dispatch/email_templates", [DispatchController, "getEmailTemplates"])
  .as("dispatch.get.email_templates");
router
  .post("/dispatch", [DispatchController, "createDispatch"])
  .as("dispatch.create");

/**
 * Generate legacy bl-collection endpoints
 */
for (const collection of BlCollections) {
  for (const endpoint of collection.endpoints) {
    CollectionEndpoint.create(endpoint, collection);
  }
}
