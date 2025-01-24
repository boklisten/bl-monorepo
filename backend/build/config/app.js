import { Secret } from "@adonisjs/core/helpers";
import { defineConfig } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { BlEnv } from "@backend/lib/config/env.js";
export const appKey = new Secret(BlEnv.APP_KEY);
export const http = defineConfig({
    generateRequestId: true,
    allowMethodSpoofing: false,
    useAsyncLocalStorage: false,
    cookie: {
        domain: "",
        path: "/",
        maxAge: "2h",
        httpOnly: true,
        secure: app.inProduction,
        sameSite: "lax",
    },
});
