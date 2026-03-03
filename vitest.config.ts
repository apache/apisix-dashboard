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
import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Only run files inside src/ — keeps Playwright e2e tests out
        include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
        // Use jsdom to simulate browser DOM environment
        environment: 'jsdom',
        // Run this file before each test file (adds jest-dom matchers)
        setupFiles: ['./src/test/setup.ts'],
        // Enable global test API (describe, it, expect, etc.) without imports
        globals: true,
        // Skip CSS processing — faster and not needed for logic tests
        css: false,
        coverage: {
            provider: 'v8',
            // Focus coverage reporting on the SchemaForm module
            include: ['src/components/form/SchemaForm/**'],
            reporter: ['text', 'html'],
        },
    },
    resolve: {
        // Mirror the path aliases from tsconfig.app.json
        alias: [
            { find: '@', replacement: resolve(__dirname, './src') },
            // Stub out unplugin-icons icon imports — icons aren't testable in jsdom
            {
                find: /^~icons\/.*/,
                replacement: resolve(__dirname, './src/test/__mocks__/Icon.tsx'),
            },
        ],
    },
});
