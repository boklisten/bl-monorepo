import { BlEnv } from "@backend/express-config/env.js";
import cors from "cors";
import { RequestHandler } from "express";

const corsHandler: RequestHandler =
  BlEnv.API_ENV === "production"
    ? cors({
        origin: BlEnv.URI_WHITELIST.split(" "),
        methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        preflightContinue: true,
        optionsSuccessStatus: 204,
      })
    : cors();

export default corsHandler;
