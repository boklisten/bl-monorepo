import { BlEnv } from "@backend/express-config/env.js";
import { RequestHandler } from "express";

const redirectToHttpsHandler: RequestHandler = (request, res, next) => {
  if (
    request.headers["x-forwarded-proto"] !== "https" &&
    BlEnv.API_ENV === "production"
  ) {
    res.redirect("https://" + request.hostname + request.url);
  } else {
    next();
  }
};

export default redirectToHttpsHandler;
