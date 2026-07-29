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

import { redactByPaths, REDACTED } from './redact';

describe('redactByPaths', () => {
  it('masks a top-level path', () => {
    expect(redactByPaths({ key: 'SECRET', header: 'apikey' }, ['key'])).toEqual({
      key: REDACTED,
      header: 'apikey',
    });
  });

  it('masks a nested path', () => {
    const cfg = { session: { redis: { password: 'p' }, secret: 's' } };
    expect(redactByPaths(cfg, ['session.redis.password'])).toEqual({
      session: { redis: { password: REDACTED }, secret: 's' },
    });
  });

  // `brokers` is `type: array` in the kafka-logger schema, and the gateway
  // still emits a flat dotted path. Walking it as an object property finds
  // nothing and silently leaves the password in plaintext — a failure that
  // looks exactly like success.
  it('applies the remaining path to EVERY element of an array', () => {
    const cfg = {
      brokers: [
        { host: 'a', sasl_config: { password: 'first' } },
        { host: 'b', sasl_config: { password: 'second' } },
      ],
    };
    expect(redactByPaths(cfg, ['brokers.sasl_config.password'])).toEqual({
      brokers: [
        { host: 'a', sasl_config: { password: REDACTED } },
        { host: 'b', sasl_config: { password: REDACTED } },
      ],
    });
  });

  it('ignores a declared path the config does not contain', () => {
    expect(redactByPaths({ header: 'apikey' }, ['key'])).toEqual({
      header: 'apikey',
    });
  });

  it('does not mutate the input', () => {
    const cfg = { key: 'SECRET' };
    redactByPaths(cfg, ['key']);
    expect(cfg).toEqual({ key: 'SECRET' });
  });

  it('replaces a non-string leaf too', () => {
    expect(redactByPaths({ auth: { conf: { a: 1 } } }, ['auth.conf'])).toEqual({
      auth: { conf: REDACTED },
    });
  });

  it('returns the input unchanged when there are no paths', () => {
    expect(redactByPaths({ key: 'SECRET' }, [])).toEqual({ key: 'SECRET' });
  });

  // `encrypt_fields` rides in over the network as part of the plugin
  // schema, so a malformed value must not crash the drawer's render.
  it('ignores a non-array paths value', () => {
    const cfg = { key: 'SECRET' };
    expect(redactByPaths(cfg, 'key')).toEqual({ key: 'SECRET' });
    expect(redactByPaths(cfg, null)).toEqual({ key: 'SECRET' });
    expect(redactByPaths(cfg, { 0: 'key' })).toEqual({ key: 'SECRET' });
  });

  it('skips a non-string element but still applies the valid ones', () => {
    expect(
      redactByPaths({ key: 'SECRET', header: 'apikey' }, [42, 'key', null])
    ).toEqual({
      key: REDACTED,
      header: 'apikey',
    });
  });
});
