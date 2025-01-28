import mongoose from "mongoose";

import { logger } from "#services/config/logger";
import env from "#start/env";

if (env.get("API_ENV") !== "test") {
  mongoose.connection.on("disconnected", () => {
    logger.error("mongoose connection was disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.warn("mongoose connection was reconnected");
  });

  mongoose.connection.on("error", () => {
    logger.error("mongoose connection has error");
  });

  await mongoose.connect(env.get("MONGODB_URI"), {
    maxPoolSize: 10,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
}
