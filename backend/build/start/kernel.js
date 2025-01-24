import router from "@adonisjs/core/services/router";
import server from "@adonisjs/core/services/server";
server.errorHandler(() => import("@backend/app/exceptions/handler.js"));
server.use([
    () => import("@backend/app/middleware/container_bindings_middleware.js"),
    () => import("@backend/app/middleware/force_json_response_middleware.js"),
    () => import("@adonisjs/cors/cors_middleware"),
]);
router.use([() => import("@adonisjs/core/bodyparser_middleware")]);
export const middleware = router.named({});
