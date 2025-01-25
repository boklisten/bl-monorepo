import { defineConfig } from "@adonisjs/cors";

import { BlEnv } from "#services/config/env";

const corsConfig = defineConfig({
  enabled: true,
  origin: BlEnv.URI_WHITELIST.split(" "),
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
});

export default corsConfig;
