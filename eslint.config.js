import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";
import tailwind from "eslint-plugin-tailwindcss";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "tailwindcss/no-custom-classname": ["warn", {
        cssFiles: [
          "resources/css/app.css",
          "resources/css/editor.css",
          "resources/css/font-delivery.css"
        ]
      }]
    }
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  ...tailwind.configs["flat/recommended"],
];
