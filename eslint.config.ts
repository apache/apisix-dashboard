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
import headers from 'eslint-plugin-headers';
import * as importPlugin from 'eslint-plugin-import';
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const importRules = tseslint.config({
  plugins: {
    'unused-imports': unusedImports,
    'simple-import-sort': simpleImportSort,
    import: importPlugin,
  },
  rules: {
    ...importPlugin.flatConfigs?.recommended.rules,
    ...importPlugin.flatConfigs?.typescript.rules,
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
  },
});

const commonRules = tseslint.config({
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    importRules,
  ],
  plugins: {
    headers: headers,
  },
  rules: {
    'headers/header-format': [
      'error',
      {
        source: 'file',
        path: '.actions/ASFLicenseHeader.txt',
      },
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: false,
      },
    ],
  },
});

const e2eRules = tseslint.config(
  {
    extends: [commonRules],
    files: ['e2e/**/*.ts'],
  },
  {
    files: ['e2e/**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
  }
);

const srcRules = tseslint.config({
  extends: [commonRules],
  files: ['src/**/*.{ts,tsx}', 'eslint.config.ts'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    sourceType: 'module',
  },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefreshPlugin,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/preserve-manual-memoization': 'off',
    'no-console': 'warn',
    'react-refresh/only-export-components': 'off',
  },
});

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts'] },
  e2eRules,
  srcRules
);
