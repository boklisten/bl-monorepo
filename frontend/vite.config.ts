import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart(),
    nitro(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    sentryTanstackStart({
      org: "boklisten",
      project: "frontend",
      authToken: process.env["SENTRY_AUTH_TOKEN"],
    }),
  ],
});
