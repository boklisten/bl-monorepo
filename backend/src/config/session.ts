import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import { RequestHandler } from "express";
import session from "express-session";

const sessionHandler: RequestHandler = session({
  resave: false,
  saveUninitialized: false,
  secret: assertEnv(BlEnvironment.SESSION_SECRET),
  cookie: { secure: assertEnv(BlEnvironment.API_ENV) === "production" },
});

export default sessionHandler;
