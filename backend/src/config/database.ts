import { BlEnv } from "@backend/express/config/env.js";
import { logger } from "@backend/express/config/logger.js";
import mongoose from "mongoose";

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
