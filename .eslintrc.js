/*
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

module.exports = {
    root: true,
    env: {
      browser: true,
      node: true,
      es6: true
    },
    parserOptions: {
      parser: '@typescript-eslint/parser',
      sourceType: 'module'
    },
    plugins: [
      'vue'
    ],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'space-before-function-paren': [2, 'never'],
      'vue/array-bracket-spacing': 'error',
      'vue/arrow-spacing': 'error',
      'vue/block-spacing': 'error',
      'vue/brace-style': 'error',
      'vue/comma-dangle': 'error',
      'vue/component-name-in-template-casing': 'error',
      'vue/eqeqeq': 'error',
      'vue/key-spacing': 'error',
      'vue/match-component-file-name': 'error',
      'vue/object-curly-spacing': 'error',
      "camelcase": ["error", {"properties": "never"}]
    },
    'extends': [
      'eslint:recommended',
      'plugin:vue/recommended',
      '@vue/standard',
      '@vue/typescript'
    ]
  }