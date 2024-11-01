// @ts-check
import js from "@eslint/js"
import gitignore from "eslint-config-flat-gitignore"
import prettier from "eslint-config-prettier"
import jsxA11y from "eslint-plugin-jsx-a11y"
import perfectionist from "eslint-plugin-perfectionist"
import unicorn from "eslint-plugin-unicorn"
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
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  // @ts-expect-error wrong types
  perfectionist.configs["recommended-natural"],
  unicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/better-regex": "error",
      "unicorn/consistent-destructuring": "error",
      "unicorn/empty-brace-spaces": "off", // Conflicts with prettier
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          multipleFileExtensions: false,
        },
      ],
      "unicorn/no-array-reduce": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  jsxA11y.flatConfigs.recommended,
  prettier,
)
