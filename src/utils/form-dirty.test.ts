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

import { isFormDirty, normalizeForCompare } from './form-dirty';

// Fixtures are real snapshots captured from the running app: on these add
// pages the form widgets normalize `undefined` into empty values on mount,
// so react-hook-form reports `isDirty === true` before the user types
// anything. A navigation guard driven by the raw flag would interrogate
// the user on 5 of 11 add pages for no reason.

describe('isFormDirty — pristine add pages must compare clean', () => {
  it('ignores empty arrays introduced on mount (ssls/add)', () => {
    const defaults = {};
    const values = { certs: [], keys: [] };
    expect(isFormDirty(defaults, values)).toBe(false);
  });

  it('ignores empty timestamp strings introduced on mount (secrets/add)', () => {
    const defaults = { id: 'abc', manager: 'vault' };
    const values = {
      create_time: '',
      update_time: '',
      id: 'abc',
      manager: 'vault',
    };
    expect(isFormDirty(defaults, values)).toBe(false);
  });

  it('ignores an empty plugins object introduced on mount (global_rules/add)', () => {
    const defaults = { id: 'abc' };
    const values = {
      create_time: '',
      update_time: '',
      id: 'abc',
      plugins: {},
    };
    expect(isFormDirty(defaults, values)).toBe(false);
  });
});

describe('isFormDirty — real edits must compare dirty', () => {
  it('detects a typed field value', () => {
    expect(isFormDirty({ desc: 'before' }, { desc: 'after' })).toBe(true);
  });

  it('detects a plugin added with an empty config', () => {
    expect(
      isFormDirty({ plugins: {} }, { plugins: { prometheus: {} } })
    ).toBe(true);
  });

  it('detects a plugin config edited to an empty member', () => {
    expect(
      isFormDirty(
        { plugins: { 'key-auth': { key: 'k' } } },
        { plugins: { 'key-auth': { key: '' } } }
      )
    ).toBe(true);
  });

  it('detects a non-empty field cleared by the user', () => {
    expect(isFormDirty({ desc: 'before' }, { desc: '' })).toBe(true);
  });
});

describe('isFormDirty — fields that must never affect the verdict', () => {
  it('ignores __-prefixed UI flags', () => {
    expect(
      isFormDirty(
        { uri: '/a', __checksEnabled: false },
        { uri: '/a', __checksEnabled: true }
      )
    ).toBe(false);
  });

  it('ignores create_time and update_time', () => {
    expect(
      isFormDirty(
        { uri: '/a', create_time: 1, update_time: 1 },
        { uri: '/a', create_time: 2, update_time: 2 }
      )
    ).toBe(false);
  });

  it('treats a missing value object as empty rather than throwing', () => {
    expect(() => isFormDirty(undefined, { uri: '/a' })).not.toThrow();
    expect(isFormDirty(undefined, { uri: '/a' })).toBe(true);
    expect(isFormDirty(undefined, {})).toBe(false);
  });
});

describe('normalizeForCompare', () => {
  it('does not mutate its input', () => {
    const input = { desc: '', plugins: { a: {} } };
    normalizeForCompare(input);
    expect(input).toEqual({ desc: '', plugins: { a: {} } });
  });
});
