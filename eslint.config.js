import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

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
    },
    "settings": {
      "react": {
        "version": "detect",
      }
    },
    rules: {
      "no-console": "warn",
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
      }]
    },
  },
)
