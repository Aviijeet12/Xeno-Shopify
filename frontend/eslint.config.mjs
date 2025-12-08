import js from "@eslint/js"
import globals from "globals"
import nextPlugin from "@next/eslint-plugin-next"

export default [
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "out/**", "pnpm-lock.yaml"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
]
