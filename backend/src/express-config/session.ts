import { BlEnv } from "@backend/express-config/env.js";
import { RequestHandler } from "express";
import session from "express-session";

const sessionHandler: RequestHandler = session({
  resave: false,
  saveUninitialized: false,
  secret: BlEnv.SESSION_SECRET,
  cookie: { secure: BlEnv.API_ENV === "production" },
});

export default sessionHandler;
