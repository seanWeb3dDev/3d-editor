module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    parser: "babel-eslint",
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "no-unused-vars": 0,
    "no-undef": 0,
  },
  plugins: ["prettier"],
};
