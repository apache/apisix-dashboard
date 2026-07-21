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

import type { StreamRoutePostType } from './schema';
import { produceStreamRoute } from './util';

// Regression for a data-integrity item of #3417: stream routes were the
// only resource whose create and edit paths ran DIFFERENT cleaning
// pipelines — create used a bare pipe without pipeProduce (no __-key
// removal, no empty-value cleaning, no empty-plugin restore; only the
// zod resolver's key-stripping stood between UI flags and the Admin API,
// which rejects unknown root keys with 400), while edit borrowed the
// HTTP-route producer. produceStreamRoute now wraps pipeProduce and is
// used by both paths.

const base = {
  server_port: 9100,
  upstream: { type: 'roundrobin', nodes: { 'a.local:80': 1 } },
} as unknown as StreamRoutePostType;

describe('produceStreamRoute', () => {
  it('strips __-prefixed UI flags', () => {
    const val = {
      ...base,
      __checksEnabled: true,
      upstream: {
        ...base.upstream,
        __checksPassiveEnabled: false,
      },
    } as unknown as StreamRoutePostType;
    const out = produceStreamRoute(val) as Record<string, unknown>;
    expect('__checksEnabled' in out).toBe(false);
    expect(
      '__checksPassiveEnabled' in (out.upstream as Record<string, unknown>)
    ).toBe(false);
  });

  it('cleans empty-string fields', () => {
    const val = { ...base, desc: '' } as unknown as StreamRoutePostType;
    const out = produceStreamRoute(val) as Record<string, unknown>;
    expect('desc' in out).toBe(false);
  });

  it('preserves plugins with empty config', () => {
    const val = {
      ...base,
      plugins: { 'key-auth': {} },
    } as unknown as StreamRoutePostType;
    const out = produceStreamRoute(val) as Record<string, unknown>;
    expect(out.plugins).toEqual({ 'key-auth': {} });
  });

  it('still deletes name/status and empty protocol', () => {
    const val = {
      ...base,
      name: 'n1',
      status: 1,
      protocol: { conf: {} },
    } as unknown as StreamRoutePostType;
    const out = produceStreamRoute(val) as Record<string, unknown>;
    expect('name' in out).toBe(false);
    expect('status' in out).toBe(false);
    expect('protocol' in out).toBe(false);
  });

  it('still drops the inline upstream when a reference id is present', () => {
    const val = {
      ...base,
      upstream_id: 'u1',
    } as unknown as StreamRoutePostType;
    const out = produceStreamRoute(val) as Record<string, unknown>;
    expect('upstream' in out).toBe(false);
  });
});
