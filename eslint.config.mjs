import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Define the base configurations you are extending
const baseConfigs = compat.extends("next/core-web-vitals", "next/typescript");

// Define the specific rule overrides
const ruleOverrides = {
  rules: {
    // Disable the rule that prevents using 'any'
    // Set to "warn" if you want warnings instead of it being completely off
    "@typescript-eslint/no-explicit-any": "off",

    // You can add other rule modifications here if needed
    // For example:
    "@typescript-eslint/no-unused-vars": "warn",
    "import/no-anonymous-default-export": "warn",
  },
};

// Combine the base configurations and your overrides.
// IMPORTANT: Your overrides must come *after* the configurations they are modifying.
const eslintConfig = [
  ...baseConfigs,
  ruleOverrides, // Add your overrides object here
];

export default eslintConfig;
