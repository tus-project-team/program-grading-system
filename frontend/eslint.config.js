// @ts-check

import js from "@eslint/js"
import query from "@tanstack/eslint-plugin-query"
import router from "@tanstack/eslint-plugin-router"
import gitignore from "eslint-config-flat-gitignore"
import prettier from "eslint-config-prettier"
import jsxA11y from "eslint-plugin-jsx-a11y"
import perfectionist from "eslint-plugin-perfectionist"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
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
  {
    files: ["src/routes/**/*.tsx"],
    ignores: ["src/routes/**/-*.tsx", "src/routes/**/-*/**/*.tsx"],
    rules: {
      "perfectionist/sort-objects": [
        "error",
        {
          // Route properties are ordered by @tanstack/eslint-plugin-router
          // @see https://tanstack.com/router/latest/docs/eslint/create-route-property-order
          ignorePattern: ["Route"],
        },
      ],
    },
  },
  ...query.configs["flat/recommended"],
  ...router.configs["flat/recommended"],
  jsxA11y.flatConfigs.recommended,
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
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "react/prop-types": "off",
    },
  },
  prettier,
)
