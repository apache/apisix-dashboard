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

import { objToUpstreamNodes } from './nodes-conversion';

// Regression for a data-integrity item of #3417: object-form nodes
// (`{"host:port": weight}`, the Admin API's documented shorthand) were
// parsed with `key.split(':')`, which shreds IPv6 hosts, and missing
// ports were replaced with an invented `port: 1` (`Number(port) || 1`) —
// a no-op edit-save then persisted the corruption (real traffic impact:
// a port-less node resolves by scheme at runtime; port 1 does not).
// Gateway facts (verified live): array-form nodes accept a missing port
// (201) and require IPv6 hosts bracketed ("[::1]" 201, "::1" 400); the
// object form accepts both bracketed-with-port ("[::1]:1980") and bare
// ("::1") IPv6 keys.

describe('objToUpstreamNodes', () => {
  it('parses host:port keys', () => {
    expect(objToUpstreamNodes({ 'httpbin.org:8080': 5 })).toEqual([
      { host: 'httpbin.org', port: 8080, weight: 5 },
    ]);
  });

  it('does not invent a port for port-less keys', () => {
    expect(objToUpstreamNodes({ 'httpbin.org': 1 })).toEqual([
      { host: 'httpbin.org', weight: 1 },
    ]);
  });

  it('keeps bracketed IPv6 hosts intact', () => {
    expect(objToUpstreamNodes({ '[::1]:1980': 1 })).toEqual([
      { host: '[::1]', port: 1980, weight: 1 },
    ]);
  });

  it('handles bracketed IPv6 without a port', () => {
    expect(objToUpstreamNodes({ '[2001:db8::1]': 2 })).toEqual([
      { host: '[2001:db8::1]', weight: 2 },
    ]);
  });

  it('brackets bare IPv6 keys (only the bracketed form is storable as an array node)', () => {
    expect(objToUpstreamNodes({ '::1': 1 })).toEqual([
      { host: '[::1]', weight: 1 },
    ]);
  });

  it('treats a non-numeric tail as part of the host instead of corrupting it', () => {
    expect(objToUpstreamNodes({ 'weird:host': 1 })).toEqual([
      { host: 'weird:host', weight: 1 },
    ]);
  });

  it('does not invent priority', () => {
    const [node] = objToUpstreamNodes({ 'a.local:80': 1 });
    expect('priority' in node).toBe(false);
  });

  it('converts IPv4 host:port', () => {
    expect(objToUpstreamNodes({ '127.0.0.1:1980': 1 })).toEqual([
      { host: '127.0.0.1', port: 1980, weight: 1 },
    ]);
  });
});
