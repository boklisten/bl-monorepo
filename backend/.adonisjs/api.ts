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
] as const;
export const api = {
  routes,
  definition: {} as ApiDefinition,
};
