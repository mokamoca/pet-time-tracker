module.exports = {
  env: { browser: true, es2021: true },
  extends: ["eslint:recommended", "plugin:react-hooks/recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react-hooks"],
  ignorePatterns: ["dist"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
};
