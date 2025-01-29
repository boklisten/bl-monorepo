// @ts-nocheck
/* eslint-disable */
// --------------------------------------------------
// This file is auto-generated by Tuyau. Do not edit manually !
// --------------------------------------------------

import type { MakeTuyauRequest, MakeTuyauResponse } from "@tuyau/utils/types";
import type { InferInput } from "@vinejs/vine/types";

type TokenPost = {
  request: MakeTuyauRequest<
    InferInput<(typeof import("../app/validators/token.ts"))["tokenValidator"]>
  >;
  response: MakeTuyauResponse<
    import("../app/controllers/auth/tokens_controller.ts").default["token"],
    true
  >;
};
type AuthIdRedirectGetHead = {
  request: unknown;
  response: MakeTuyauResponse<
    import("../app/controllers/auth/social_controller.ts").default["redirect"],
    false
  >;
};
type AuthIdCallbackGetHead = {
  request: unknown;
  response: MakeTuyauResponse<
    import("../app/controllers/auth/social_controller.ts").default["callback"],
    false
  >;
};
type AuthLocalLoginPost = {
  request: unknown;
  response: MakeTuyauResponse<
    import("../app/controllers/auth/local_controller.ts").default["login"],
    false
  >;
};
type AuthLocalRegisterPost = {
  request: unknown;
  response: MakeTuyauResponse<
    import("../app/controllers/auth/local_controller.ts").default["register"],
    false
  >;
};
export interface ApiDefinition {
  token: {
    $url: {};
    $post: TokenPost;
  };
  auth: {
    ":provider": {
      redirect: {
        $url: {};
        $get: AuthIdRedirectGetHead;
        $head: AuthIdRedirectGetHead;
      };
      callback: {
        $url: {};
        $get: AuthIdCallbackGetHead;
        $head: AuthIdCallbackGetHead;
      };
    };
    local: {
      login: {
        $url: {};
        $post: AuthLocalLoginPost;
      };
      register: {
        $url: {};
        $post: AuthLocalRegisterPost;
      };
    };
  };
}
const routes = [
  {
    params: [],
    name: "auth.token",
    path: "/token",
    method: ["POST"],
    types: {} as TokenPost,
  },
  {
    params: ["provider"],
    name: "auth.social.redirect",
    path: "/auth/:provider/redirect",
    method: ["GET", "HEAD"],
    types: {} as AuthIdRedirectGetHead,
  },
  {
    params: ["provider"],
    name: "auth.social.callback",
    path: "/auth/:provider/callback",
    method: ["GET", "HEAD"],
    types: {} as AuthIdCallbackGetHead,
  },
  {
    params: [],
    name: "auth.local.login",
    path: "/auth/local/login",
    method: ["POST"],
    types: {} as AuthLocalLoginPost,
  },
  {
    params: [],
    name: "auth.local.register",
    path: "/auth/local/register",
    method: ["POST"],
    types: {} as AuthLocalRegisterPost,
  },
  {
    params: ["id"],
    name: "collection.branches.getId",
    path: "/branches/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.branches.getAll",
    path: "/branches",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.branches.post",
    path: "/branches",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.branches.patch",
    path: "/branches/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.branchitems.getId",
    path: "/branchitems/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.branchitems.post",
    path: "/branchitems",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.branchitems.patch",
    path: "/branchitems/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.branchitems.getAll",
    path: "/branchitems",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.branchitems.delete",
    path: "/branchitems/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.customeritems.getId",
    path: "/customeritems/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.customeritems.patch",
    path: "/customeritems/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.customeritems.post",
    path: "/customeritems",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.customeritems.operation.generate-report.post",
    path: "/customeritems/generate-report",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.customeritems.operation.public-blid-lookup.post",
    path: "/customeritems/public-blid-lookup",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.customeritems.getAll",
    path: "/customeritems",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.deliveries.post",
    path: "/deliveries",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.deliveries.operation.postal-code-lookup.post",
    path: "/deliveries/postal-code-lookup",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.deliveries.getAll",
    path: "/deliveries",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.deliveries.getId",
    path: "/deliveries/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.deliveries.patch",
    path: "/deliveries/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.deliveries.delete",
    path: "/deliveries/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.items.getId",
    path: "/items/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.items.getAll",
    path: "/items",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.items.post",
    path: "/items",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.items.patch",
    path: "/items/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.openinghours.getId",
    path: "/openinghours/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.openinghours.getAll",
    path: "/openinghours",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.openinghours.post",
    path: "/openinghours",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.openinghours.patch",
    path: "/openinghours/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.orders.post",
    path: "/orders",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.orders.operation.rapid-handout.post",
    path: "/orders/rapid-handout",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.delete",
    path: "/orders/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.patch",
    path: "/orders/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.operation.place.patch",
    path: "/orders/:id/place",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.operation.confirm.patch",
    path: "/orders/:id/confirm",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.getId",
    path: "/orders/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.operation.receipt.getId",
    path: "/orders/:id/receipt",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.orders.operation.agreement.getId",
    path: "/orders/:id/agreement",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.orders.getAll",
    path: "/orders",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.payments.post",
    path: "/payments",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.payments.getAll",
    path: "/payments",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.payments.getId",
    path: "/payments/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.payments.patch",
    path: "/payments/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.payments.delete",
    path: "/payments/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.getId",
    path: "/userdetails/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.operation.valid.getId",
    path: "/userdetails/:id/valid",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.operation.permission.getId",
    path: "/userdetails/:id/permission",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.patch",
    path: "/userdetails/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.operation.permission.patch",
    path: "/userdetails/:id/permission",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.operation.email.patch",
    path: "/userdetails/:id/email",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.userdetails.delete",
    path: "/userdetails/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.userdetails.getAll",
    path: "/userdetails",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.pendingpasswordresets.post",
    path: "/pendingpasswordresets",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.pendingpasswordresets.patch",
    path: "/pendingpasswordresets/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.pendingpasswordresets.operation.confirm.patch",
    path: "/pendingpasswordresets/:id/confirm",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.email_validations.post",
    path: "/email_validations",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.email_validations.patch",
    path: "/email_validations/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.email_validations.operation.confirm.patch",
    path: "/email_validations/:id/confirm",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.messages.post",
    path: "/messages",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.messages.operation.sendgrid-events.post",
    path: "/messages/sendgrid-events",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.messages.operation.twilio-sms-events.post",
    path: "/messages/twilio-sms-events",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.messages.getAll",
    path: "/messages",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.messages.getId",
    path: "/messages/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.messages.delete",
    path: "/messages/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.stand_matches.getAll",
    path: "/stand_matches",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.stand_matches.operation.me.getAll",
    path: "/stand_matches/me",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.post",
    path: "/user_matches",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.operation.generate.post",
    path: "/user_matches/generate",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.operation.notify.post",
    path: "/user_matches/notify",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.operation.transfer-item.post",
    path: "/user_matches/transfer-item",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.operation.lock.post",
    path: "/user_matches/lock",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.getAll",
    path: "/user_matches",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.user_matches.operation.me.getAll",
    path: "/user_matches/me",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.invoices.getId",
    path: "/invoices/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.invoices.getAll",
    path: "/invoices",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.invoices.post",
    path: "/invoices",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.invoices.patch",
    path: "/invoices/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.companies.getAll",
    path: "/companies",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.companies.getId",
    path: "/companies/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.companies.post",
    path: "/companies",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.companies.patch",
    path: "/companies/:id",
    method: ["PATCH"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.companies.delete",
    path: "/companies/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.uniqueitems.post",
    path: "/uniqueitems",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.uniqueitems.operation.generate.post",
    path: "/uniqueitems/generate",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.uniqueitems.getId",
    path: "/uniqueitems/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.uniqueitems.operation.active.getId",
    path: "/uniqueitems/:id/active",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.uniqueitems.getAll",
    path: "/uniqueitems",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.editabletexts.getId",
    path: "/editabletexts/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.editabletexts.getAll",
    path: "/editabletexts",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.editabletexts.put",
    path: "/editabletexts/:id",
    method: ["PUT"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.editabletexts.delete",
    path: "/editabletexts/:id",
    method: ["DELETE"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.signatures.post",
    path: "/signatures",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.signatures.operation.guardian.post",
    path: "/signatures/guardian",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: [],
    name: "collection.signatures.operation.check-guardian-signature.post",
    path: "/signatures/check-guardian-signature",
    method: ["POST"],
    types: {} as unknown,
  },
  {
    params: ["id"],
    name: "collection.signatures.getId",
    path: "/signatures/:id",
    method: ["GET", "HEAD"],
    types: {} as unknown,
  },
] as const;
export const api = {
  routes,
  definition: {} as ApiDefinition,
};
