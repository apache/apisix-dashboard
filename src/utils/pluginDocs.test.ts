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
import { describe, expect, it } from 'vitest';

import { getPluginDocsUrl } from './pluginDocs';

const BASE = 'https://apisix.apache.org';

describe('getPluginDocsUrl', () => {
  it('builds the released-docs URL from the plugin name', () => {
    expect(getPluginDocsUrl('key-auth', 'en')).toBe(
      `${BASE}/docs/apisix/plugins/key-auth/`
    );
  });

  it.each([
    'serverless-pre-function',
    'serverless-post-function',
  ])('sends %s to the shared serverless page', (name) => {
    expect(getPluginDocsUrl(name, 'en')).toBe(
      `${BASE}/docs/apisix/plugins/serverless/`
    );
  });

  // Verified against the live docs site on 2026-08-03: these are the only
  // names with no page on the released docs. `example-plugin` is the
  // gateway's sample and `ai` has no page of its own; the other three are
  // newer than the current docs release.
  it.each([
    'example-plugin',
    'ai',
    'ai-cache',
    'ai-lakera-guard',
    'mcp-bridge',
  ])('returns null for %s, which has no released docs page', (name) => {
    expect(getPluginDocsUrl(name, 'en')).toBeNull();
  });

  it('uses the Chinese docs when the UI language is zh', () => {
    expect(getPluginDocsUrl('key-auth', 'zh')).toBe(
      `${BASE}/zh/docs/apisix/plugins/key-auth/`
    );
  });

  // The docs site publishes en and zh only; /es/, /de/ and /tr/ are 404.
  it.each(['es', 'de', 'tr'])(
    'falls back to English for %s, which the docs site does not publish',
    (language) => {
      expect(getPluginDocsUrl('key-auth', language)).toBe(
        `${BASE}/docs/apisix/plugins/key-auth/`
      );
    }
  );

  it('applies the zh prefix and the slug override together', () => {
    expect(getPluginDocsUrl('serverless-pre-function', 'zh')).toBe(
      `${BASE}/zh/docs/apisix/plugins/serverless/`
    );
  });
});
