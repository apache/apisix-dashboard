import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
      "unused-imports": unusedImports,
    },
    "settings": {
      "react": {
        "version": "detect",
      }
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "react/jsx-curly-brace-presence": [
        "error",
        {
          "props": "never",
          "children": "never"
        }
      ],
      "react/no-unescaped-entities": [
        "error",
        {
          "forbid": [">", "}"]
        }
      ],
      "react/no-children-prop": ["error", {
        "allowFunctions": true
      }],
      "react/self-closing-comp": ["error", {
        "component": true,
        "html": true
      }]
    },
  },
)
