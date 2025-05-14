/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import js from '@eslint/js'
import i18n from '@m6web/eslint-plugin-i18n';
import headers from 'eslint-plugin-headers';
import i18next from 'eslint-plugin-i18next';
import * as importPlugin from 'eslint-plugin-import';
import playwright from 'eslint-plugin-playwright'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const importRules = tseslint.config({
  plugins: {
    'unused-imports': unusedImports,
    'simple-import-sort': simpleImportSort,
    'import': importPlugin,
  },
  rules: {
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        'vars': 'all',
        'varsIgnorePattern': '^_',
        'args': 'after-used',
        'argsIgnorePattern': '^_',
      },
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off',
    'import/no-named-as-default-member': 'off',
  }
})

const e2eRules = tseslint.config({
  extends: [importRules],
  ...playwright.configs['flat/recommended'],
  files: ['e2e/**/*.spec.ts'],
  rules: {
    ...playwright.configs['flat/recommended'].rules,
  },
});

const i18nRules = tseslint.config({
  files: ['src/**/*.{ts,tsx,js}'],
  plugins: {
    i18next: i18next,
    i18n: i18n,
  },
  rules: {
    ...i18next.configs['flat/recommended'].rules,
    'i18n/no-unknown-key': 'error',
    'i18n/no-text-as-children': [
      'error',
      { ignorePattern: '^\\s?[/.]\\s?$' },
    ],
    'i18n/no-text-as-attribute': ['error', { attributes: ['alt', 'title'] }],
    'i18n/interpolation-data': [
      'error',
      { interpolationPattern: '\\{\\.+\\}' },
    ],
  },
  settings: {
    i18n: {
      principalLangs: [
        {
          name: 'en',
          translationPath: 'src/locales/en/common.json',
        },
      ],
      functionName: 't',
    },
  },
})

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts'] },
  e2eRules,
  i18nRules,
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, importRules],
    files: ['src/**/*.{ts,tsx}', 'eslint.config.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      sourceType: 'module',
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react: react,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
      headers: headers,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...importPlugin.flatConfigs?.recommended.rules,
      ...importPlugin.flatConfigs?.typescript.rules,
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never',
        },
      ],
      'react/no-unescaped-entities': [
        'error',
        {
          forbid: ['>', '}'],
        },
      ],
      'react/no-children-prop': [
        'error',
        {
          allowFunctions: true,
        },
      ],
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'headers/header-format': [
        'error',
        {
          source: 'file',
          path: '.actions/ASFLicenseHeader.txt',
        },
      ],
      'quotes': [
        'error',
        'single',
        {
          'avoidEscape': true,
          'allowTemplateLiterals': false
        }
      ],
    },
  }
);
