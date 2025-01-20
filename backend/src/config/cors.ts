import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import cors from "cors";
import { RequestHandler } from "express";

const corsHandler: RequestHandler =
  assertEnv(BlEnvironment.API_ENV) === "production"
    ? cors({
        origin: assertEnv(BlEnvironment.URI_WHITELIST).split(" "),
        methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        preflightContinue: true,
        optionsSuccessStatus: 204,
      })
    : cors();

export default corsHandler;
