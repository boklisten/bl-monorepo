import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import { RequestHandler } from "express";

const redirectToHttpsHandler: RequestHandler = (request, res, next) => {
  if (
    request.headers["x-forwarded-proto"] !== "https" &&
    assertEnv(BlEnvironment.API_ENV) === "production"
  ) {
    res.redirect("https://" + request.hostname + request.url);
  } else {
    next();
  }
};

export default redirectToHttpsHandler;
