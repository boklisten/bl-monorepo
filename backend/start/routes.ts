import router from "@adonisjs/core/services/router";

import { controllers } from "#generated/controllers";
import CollectionEndpoint from "#services/legacy/collection-endpoint/collection-endpoint";
import BlCollections from "#services/legacy/collections/bl-collections";

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
  .post("/token", [controllers.auth.Tokens, "legacyToken"])
  .as("auth.legacyToken");
router
  .post("/v2/token", [controllers.auth.Tokens, "token"])
  .as("v2.auth.token");

/**
 * auth vipps
 */
router
  .get("/auth/vipps/redirect", [controllers.auth.Vipps, "redirect"])
  .as("auth.vipps.redirect");
router
  .get("/auth/vipps/callback", [controllers.auth.Vipps, "callback"])
  .as("auth.vipps.callback");

/**
 * auth local
 */
router
  .post("/auth/local/login", [controllers.auth.Local, "login"])
  .as("auth.local.login");
router
  .post("/auth/local/register", [controllers.auth.Local, "register"])
  .as("auth.local.register");

/**
 * password reset
 */
router
  .post("/forgot_password", [
    controllers.auth.PasswordReset,
    "requestPasswordReset",
  ])
  .as("auth.password.forgot");
router
  .post("/reset_password/validate", [
    controllers.auth.PasswordReset,
    "validatePasswordReset",
  ])
  .as("auth.password.reset.validate");
router
  .post("/reset_password", [controllers.auth.PasswordReset, "resetPassword"])
  .as("auth.password.reset");

router
  .get("/waiting_list_entries", [
    controllers.WaitingListEntries,
    "getAllWaitingListEntries",
  ])
  .as("waiting_list_entries.getAll");
router
  .post("/waiting_list_entries", [
    controllers.WaitingListEntries,
    "addWaitingListEntry",
  ])
  .as("waiting_list_entries.add");
router
  .delete("/waiting_list_entries/:id", [
    controllers.WaitingListEntries,
    "deleteWaitingListEntry",
  ])
  .as("waiting_list_entries.delete");

/**
 * reminders
 */
router
  .post("/reminders/count_recipients", [
    controllers.Reminders,
    "countRecipients",
  ])
  .as("reminders.count_recipients");
router
  .post("/reminders/send", [controllers.Reminders, "remind"])
  .as("reminders.send");

/**
 * branches
 */
router
  .post("/v2/branches", [controllers.branches.Branches, "add"])
  .as("branches.add");
router
  .patch("/v2/branches", [controllers.branches.Branches, "update"])
  .as("branches.update");

/**
 * branch upload
 */
router
  .post("/v2/branches/memberships", [
    controllers.branches.BranchUpload,
    "uploadMemberships",
  ])
  .as("branches.addMemberships");
router
  .post("/v2/branches/subject_choices", [
    controllers.branches.BranchUpload,
    "uploadSubjectChoices",
  ])
  .as("branches.addSubjectChoices");

/**
 * branch relationships
 */
router
  .patch("/v2/branches/relationships", [
    controllers.branches.BranchRelationship,
    "update",
  ])
  .as("branches.relationships.update");

/**
 * branch memberships
 */
router
  .get("/v2/branches/memberships/:branchId", [
    controllers.branches.BranchMembership,
    "getMembers",
  ])
  .as("branches.memberships.get");
router
  .patch("/branches/memberships", [
    controllers.branches.BranchMembership,
    "updateMembership",
  ])
  .as("branches.memberships.update");
router
  .delete("/branches/memberships/direct/:branchId", [
    controllers.branches.BranchMembership,
    "removeDirectMembers",
  ])
  .as("branches.memberships.remove.direct");
router
  .delete("/branches/memberships/indirect/:branchId", [
    controllers.branches.BranchMembership,
    "removeIndirectMembers",
  ])
  .as("branches.memberships.remove.indirect");

/**
 * orders
 */
router
  .get("/v2/orders/open_orders", [controllers.Orders, "getOpenOrders"])
  .as("open_orders.get");
router
  .post("/v2/orders/cancel_order_item", [controllers.Orders, "cancelOrderItem"])
  .as("open_orders.cancel");

/**
 * editable texts
 */
router
  .get("/editable_texts", [controllers.EditableTexts, "getAll"])
  .as("editable_texts.getAll");
router
  .get("/editable_texts/key/:key", [controllers.EditableTexts, "getByKey"])
  .as("editable_texts.getByKey");
router
  .post("/editable_texts", [controllers.EditableTexts, "store"])
  .as("editable_texts.store");
router
  .patch("/editable_texts/:id", [controllers.EditableTexts, "update"])
  .as("editable_texts.update");
router
  .delete("/editable_texts/:id", [controllers.EditableTexts, "destroy"])
  .as("editable_texts.destroy");

/**
 * questions and answers
 */
router
  .get("/questions_and_answers", [controllers.QuestionsAndAnswers, "getAll"])
  .as("questions_and_answers.getAll");
router
  .post("/questions_and_answers", [controllers.QuestionsAndAnswers, "store"])
  .as("questions_and_answers.store");
router
  .patch("/questions_and_answers/:id", [
    controllers.QuestionsAndAnswers,
    "update",
  ])
  .as("questions_and_answers.update");
router
  .delete("/questions_and_answers/:id", [
    controllers.QuestionsAndAnswers,
    "destroy",
  ])
  .as("questions_and_answers.destroy");

/**
 * email validations
 */
router
  .post("/email_validations", [controllers.EmailValidations, "create"])
  .as("email_validations.create");
router
  .get("/email_validations/:id", [controllers.EmailValidations, "confirm"])
  .as("email_validations.confirm");

/**
 * public blid lookup
 */
router
  .get("/public_blid_lookup/:blid", [controllers.PublicBlidLookup, "lookup"])
  .as("blid.lookup");

/**
 * matches
 */
router
  .post("/matches/generate", [controllers.matches.Matches, "generate"])
  .as("matches.generate");
router
  .post("/matches/notify", [controllers.matches.Matches, "notify"])
  .as("matches.notify");
router
  .post("/user_matches/lock", [controllers.matches.Matches, "lock"])
  .as("matches.lock");
router
  .get("/matches/me", [controllers.matches.Matches, "getMyMatches"])
  .as("matches.getMyMatches");
router
  .post("/matches/transfer_item", [controllers.matches.Matches, "transferItem"])
  .as("matches.transfer_item");

/**
 * user detail
 */
router
  .get("/v2/user_details/id/:detailsId", [controllers.UserDetail, "getById"])
  .as("user_detail.getById");
router
  .get("/v2/user_details/me", [controllers.UserDetail, "getMyDetails"])
  .as("user_detail.getMyDetails");
router
  .post("/v2/user_details", [controllers.UserDetail, "updateAsCustomer"])
  .as("user_detail.updateAsCustomer");
router
  .post("/v2/employee/user_details/:detailsId", [
    controllers.UserDetail,
    "updateAsEmployee",
  ])
  .as("user_detail.updateAsEmployee");

/**
 * customer items
 */
router
  .get("/v2/customer_items", [controllers.CustomerItems, "getCustomerItems"])
  .as("customer_items.get");

/**
 * signatures
 */
router
  .post("/signatures/send/:detailsId", [
    controllers.Signatures,
    "sendSignatureLink",
  ])
  .as("signatures.send.link");
router
  .post("/signatures/me/send", [
    controllers.Signatures,
    "sendSignatureLinkAsCustomer",
  ])
  .as("signatures.me.send");
router
  .get("/signatures/valid/:detailsId", [
    controllers.Signatures,
    "hasValidSignature",
  ])
  .as("signatures.valid");
router
  .get("/signatures/get/:detailsId", [controllers.Signatures, "getSignature"])
  .as("signatures.get");
router
  .post("/signatures/sign/:detailsId", [controllers.Signatures, "sign"])
  .as("signatures.sign");

/**
 * Unique Ids
 */
router
  .get("/unique_ids/token", [controllers.UniqueIds, "getToken"])
  .as("unique_ids.token");
router
  .get("/unique_ids/download_pdf/:token", [
    controllers.UniqueIds,
    "downloadUniqueIdPdf",
  ])
  .as("unique_ids.download.pdf");

/**
 * User Provisioning
 */
router
  .post("/users/create", [controllers.UserProvisioning, "createUsers"])
  .as("users.create");

/**
 * Unique Items
 */
router
  .post("/unique_items/add", [controllers.UniqueItems, "add"])
  .as("unique_items.add");

/**
 * Order History
 */

router
  .get("/order_history/me/:orderId", [controllers.OrderHistory, "getMyOrder"])
  .as("order_history.get.my.order");
router
  .get("/order_history/me", [controllers.OrderHistory, "getMyOrders"])
  .as("order_history.get.my.orders");

/**
 * Checkout
 */
router
  .post("/checkout", [controllers.Checkout, "initializeCheckout"])
  .as("checkout.initialize");
router
  .post("/checkout/confirm/:orderId", [controllers.Checkout, "confirmCheckout"])
  .as("checkout.confirm");
router
  .post("/checkout/vipps/callback", [
    controllers.Checkout,
    "handleVippsCallback",
  ])
  .as("checkout.vipps.callback");
router
  .get("/checkout/poll/:orderId", [controllers.Checkout, "pollPayment"])
  .as("checkout.poll");

/**
 * Subjects
 */
router
  .get("/subjects/:branchId", [controllers.Subjects, "getBranchSubjects"])
  .as("subjects.get.branch.subjects");
router
  .get("/branch_items/:branchId", [controllers.BranchItems, "getBranchItems"])
  .as("branch_items.get");
router
  .post("/branch_items", [controllers.BranchItems, "setBranchItems"])
  .as("branch_items.post");

/**
 * Postal
 */
router
  .get("/postal/lookup/postal_code/:postalCode", [
    controllers.Postal,
    "lookupPostalCode",
  ])
  .as("lookup.postal.code");

/**
 * Companies
 */
router
  .get("/v2/companies", [controllers.Companies, "getCompanies"])
  .as("companies.get");
router
  .post("/v2/companies", [controllers.Companies, "addCompany"])
  .as("companies.add");
router
  .delete("/v2/companies/:companyId", [controllers.Companies, "deleteCompany"])
  .as("companies.delete");

/**
 * Opening Hours
 */
router
  .get("/v2/opening_hours/:id", [controllers.OpeningHours, "get"])
  .as("opening_hours.get");
router
  .post("/v2/opening_hours", [controllers.OpeningHours, "add"])
  .as("opening_hours.add");
router
  .delete("/v2/opening_hours/:id", [controllers.OpeningHours, "delete"])
  .as("opening_hours.delete");

/**
 * Items
 */
router.get("/v2/items", [controllers.Items, "get"]).as("items.get");

/**
 * Dispatch
 */
router
  .get("/dispatch/email_templates", [controllers.Dispatch, "getEmailTemplates"])
  .as("dispatch.get.email_templates");
router
  .post("/dispatch", [controllers.Dispatch, "createDispatch"])
  .as("dispatch.create");

/**
 * Generate legacy bl-collection endpoints
 */
for (const collection of BlCollections) {
  for (const endpoint of collection.endpoints) {
    CollectionEndpoint.create(endpoint, collection);
  }
}
