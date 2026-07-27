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
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// Structural key-parity guard for the locale bundles (#3417 test-suite gap).
// The lang-switch integration spec only exercises runtime behaviour and
// self-skips if the switcher isn't found; nothing asserted that every locale
// actually defines the same set of keys as the base (`en`). A missing key
// falls back to English silently at runtime, so a locale can drift out of
// parity — e.g. the `a11y.*` keys added for the base bundle were absent from
// de/es/tr — without any test noticing.
//
// This does NOT check that values are translated (a locale may legitimately
// share a string with English); it checks only that the key SETS match, which
// is the part a unit test can enforce cheaply and deterministically.

const LOCALES_DIR = fileURLToPath(new URL('./locales/', import.meta.url));
const BASE_LANG = 'en';

const flattenKeys = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    flattenKeys(v, prefix ? `${prefix}.${k}` : k)
  );
};

const loadKeys = (lang: string): Set<string> => {
  const raw = readFileSync(`${LOCALES_DIR}${lang}/common.json`, 'utf8');
  return new Set(flattenKeys(JSON.parse(raw)));
};

const langs = readdirSync(LOCALES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const baseKeys = loadKeys(BASE_LANG);
const otherLangs = langs.filter((l) => l !== BASE_LANG);

describe('locale key parity', () => {
  it('discovers the base locale and at least one other', () => {
    expect(langs).toContain(BASE_LANG);
    expect(otherLangs.length).toBeGreaterThan(0);
  });

  it.each(otherLangs)('%s defines exactly the base locale keys', (lang) => {
    const keys = loadKeys(lang);
    const missing = [...baseKeys].filter((k) => !keys.has(k)).sort();
    const extra = [...keys].filter((k) => !baseKeys.has(k)).sort();
    expect(
      { missing, extra },
      `${lang} is out of key-parity with ${BASE_LANG}`
    ).toEqual({ missing: [], extra: [] });
  });
});
