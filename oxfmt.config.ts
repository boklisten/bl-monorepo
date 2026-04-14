import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["routeTree.gen.ts", ".adonisjs", "**/database/schema.ts", "openapi"],
});
