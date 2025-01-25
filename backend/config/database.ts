import mongoose from "mongoose";

import { BlEnv } from "#services/config/env";
import { logger } from "#services/config/logger";

export default async function configureMongoose() {
  mongoose.connection.on("disconnected", () => {
    logger.error("mongoose connection was disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.warn("mongoose connection was reconnected");
  });

  mongoose.connection.on("error", () => {
    logger.error("mongoose connection has error");
  });

  await mongoose.connect(BlEnv.MONGODB_URI, {
    maxPoolSize: 10,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
}
