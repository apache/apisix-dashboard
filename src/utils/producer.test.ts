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

import { pipeProduce, rmDoubleUnderscoreKeys } from './producer';

// Regression for a data-integrity item of #3417: `typeof null === 'object'`,
// so the recursion descended into null values and threw
// `TypeError: Cannot convert undefined or null to object` at
// `Object.keys(null)`. The producer runs FIRST in pipeProduce — before the
// null-cleaner — so any null anywhere in a submit draft (e.g. typed into a
// plugin's JSON editor, or stored via the Admin API, which accepts nulls in
// plugin configs) crashed every submit of that resource, with no request
// sent and no user feedback.

describe('rmDoubleUnderscoreKeys', () => {
  it('does not throw on null values', () => {
    const draft = {
      plugins: { 'key-auth': { custom_note: null } },
    };
    expect(() => rmDoubleUnderscoreKeys(draft)).not.toThrow();
  });

  it('leaves null values in place for the downstream null-cleaner', () => {
    const draft = {
      plugins: { 'key-auth': { custom_note: null, header: 'apikey' } },
    };
    rmDoubleUnderscoreKeys(draft);
    expect(draft.plugins['key-auth']).toEqual({
      custom_note: null,
      header: 'apikey',
    });
  });

  it('still removes __-prefixed keys at every depth', () => {
    const draft = {
      __checksEnabled: true,
      upstream: { __checksPassiveEnabled: false, scheme: 'http' },
      plugins: { 'key-auth': { custom_note: null, __ui: 1 } },
    };
    rmDoubleUnderscoreKeys(draft);
    expect(draft).toEqual({
      upstream: { scheme: 'http' },
      plugins: { 'key-auth': { custom_note: null } },
    });
  });
});

describe('pipeProduce', () => {
  it('does not throw when a plugin config contains null', () => {
    const val = {
      name: 'r1',
      uri: '/r1',
      plugins: { 'key-auth': { custom_note: null } },
      upstream: { type: 'roundrobin', nodes: { 'a.local:80': 1 } },
    };
    let produced: typeof val | undefined;
    expect(() => {
      produced = pipeProduce()(val);
    }).not.toThrow();
    // the plugin entry must survive the pipeline; the null member itself is
    // owned by the existing null-cleaner / empty-plugin-restore stages
    expect(produced?.plugins['key-auth']).toBeTruthy();
  });
});
