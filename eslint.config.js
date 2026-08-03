import eslint from "@eslint/js";
import { defineConfig } from "eslint/config"; // Native modern config helper

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Scans your main source engine logic and test folders
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser, // Explicit parser configuration
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-fallthrough": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
    },
  },
  {
    // Ignore build output targets and dependency directories
    ignores: ["dist/**", "node_modules/**"],
  },
]);
