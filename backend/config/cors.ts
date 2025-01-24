import { defineConfig } from "@adonisjs/cors";
import { BlEnv } from "@backend/lib/config/env.js";

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
