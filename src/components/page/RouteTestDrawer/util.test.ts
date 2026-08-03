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

import { buildUrl, deriveFromRoute, GATEWAY_URL_PLACEHOLDER, toCurl } from './util';

describe('deriveFromRoute', () => {
  it('uses the first declared method', () => {
    const req = deriveFromRoute({ uri: '/a', methods: ['POST', 'GET'] });
    expect(req.method).toBe('POST');
  });

  it('defaults to GET when no methods are declared (route matches all)', () => {
    const req = deriveFromRoute({ uri: '/a' });
    expect(req.method).toBe('GET');
  });

  it('prefers uri, falling back to uris[0], then "/"', () => {
    expect(deriveFromRoute({ uri: '/x' }).path).toBe('/x');
    expect(deriveFromRoute({ uris: ['/y', '/z'] }).path).toBe('/y');
    expect(deriveFromRoute({}).path).toBe('/');
  });

  it('prefills a Host header from hosts[0] (or host) when present', () => {
    expect(deriveFromRoute({ uri: '/a', hosts: ['ex.com'] }).headers).toEqual([
      { name: 'Host', value: 'ex.com' },
    ]);
    expect(deriveFromRoute({ uri: '/a', host: 'h.com' }).headers).toEqual([
      { name: 'Host', value: 'h.com' },
    ]);
  });

  it('adds no headers when the route has no host match', () => {
    expect(deriveFromRoute({ uri: '/a' }).headers).toEqual([]);
  });

  it('carries a wildcard uri through verbatim', () => {
    expect(deriveFromRoute({ uri: '/api/*' }).path).toBe('/api/*');
  });
});

describe('buildUrl', () => {
  it('joins base and path, trimming a trailing slash and ensuring a leading one', () => {
    expect(buildUrl('http://h:9080/', 'hello')).toBe('http://h:9080/hello');
    expect(buildUrl('http://h:9080', '/hello')).toBe('http://h:9080/hello');
  });
});

describe('toCurl', () => {
  const base = { method: 'GET', path: '/hello', headers: [], body: '' };

  it('renders method, quoted url and header lines', () => {
    const out = toCurl(
      { ...base, headers: [{ name: 'Host', value: 'ex.com' }] },
      'http://127.0.0.1:9080'
    );
    expect(out).toBe(
      "curl -X GET 'http://127.0.0.1:9080/hello' \\\n  -H 'Host: ex.com'"
    );
  });

  it('uses the placeholder base when gateway url is empty', () => {
    const out = toCurl(base, '   ');
    expect(out).toContain(`'${GATEWAY_URL_PLACEHOLDER}/hello'`);
  });

  it('escapes single quotes in values (shell single-quote rule)', () => {
    const out = toCurl(
      { ...base, headers: [{ name: 'X-Note', value: "a'b" }] },
      'http://h:9080'
    );
    expect(out).toContain('-H \'X-Note: a\'\\\'\'b\'');
  });

  it('appends --data-raw only for body-bearing methods with a non-empty body', () => {
    expect(toCurl({ ...base, method: 'POST', body: '{"a":1}' }, 'http://h')).toContain(
      '--data-raw \'{"a":1}\''
    );
    expect(toCurl({ ...base, method: 'GET', body: 'x' }, 'http://h')).not.toContain(
      '--data-raw'
    );
  });

  it('skips header rows with a blank name', () => {
    const out = toCurl(
      { ...base, headers: [{ name: '  ', value: 'v' }] },
      'http://h'
    );
    expect(out).not.toContain('-H');
  });
});
