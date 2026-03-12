import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    nitro(),
    react({
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
