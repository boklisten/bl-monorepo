import env from "#start/env";
import { defineConfig } from "@adonisjs/lucid";

const dbConfig = defineConfig({
  connection: "postgres",
  connections: {
    postgres: {
      client: "pg",
      connection: env.get("POSTGRES_URL"),
      migrations: {
        naturalSort: true,
        paths: ["database/migrations"],
      },
    },
  },
});

export default dbConfig;
