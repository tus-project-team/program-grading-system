// @ts-check

import js from "@eslint/js"
import gitignore from "eslint-config-flat-gitignore"
import perfectionist from "eslint-plugin-perfectionist"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import query from "@tanstack/eslint-plugin-query"
import tseslint from "typescript-eslint"

export default tseslint.config(
  gitignore(),
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  perfectionist.configs["recommended-natural"],
  ...query.configs["flat/recommended"],
  // @ts-expect-error eslint-plugin-react types are incorrect
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
)
