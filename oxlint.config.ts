import { defineConfig } from "oxlint";

export default defineConfig({
  /*
  fixme: enable for stricter checks
  options: {
    typeAware: true,
    typeCheck: true,
  },
   */
  plugins: [
    "eslint",
    "typescript",
    "unicorn",
    "react",
    "react-perf",
    "oxc",
    // "import", fixme: enable for stricter checks
    "jsx-a11y",
    "promise",
  ],
});
