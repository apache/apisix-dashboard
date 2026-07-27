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

// Regression for the #3417 test-suite gap: there was no general round-trip
// invariant. #3414 (the SSL mTLS client block wiped on edit-save) is one
// instance of a whole class — a resource seeded via the Admin API, opened in
// the dashboard and saved WITHOUT any user change, must come back unchanged.
// Per-field specs cover specific known losses; this is the parametrised guard
// that catches future ones.
//
// Both sides of the comparison are Admin-API-stored values, so they are
// canonicalised by the gateway. `canonicalize` drops the server-managed
// timestamps and folds any array-form upstream `nodes` back to the object-map
// form the gateway stores, so a benign representation reshuffle isn't a false
// failure, while a genuinely dropped or emptied field still surfaces as a diff.
//
// SSL and Secret are intentionally excluded: their private key / manager
// tokens are write-only (never returned by the API), so a pure no-op save
// legitimately cannot reproduce them. The SSL client-block case is covered by
// ssls.noop-edit-preserves-client.spec.ts, which re-enters the key.

import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { expect, type Page } from '@playwright/test';

import type { FileRouteTypes } from '@/routeTree.gen';

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === 'create_time' || k === 'update_time') continue;
      if (k === 'nodes' && Array.isArray(v)) {
        out.nodes = Object.fromEntries(
          (v as { host: string; port?: number; weight: number }[]).map((n) => [
            n.port === undefined ? n.host : `${n.host}:${n.port}`,
            n.weight,
          ])
        );
      } else {
        out[k] = canonicalize(v);
      }
    }
    return out;
  }
  return value;
};

type RoundTripCase = {
  label: string;
  // PUT a rich resource, returning its id and the stored value (S1).
  seed: () => Promise<{ id: string; stored: Record<string, unknown> }>;
  detailTo: FileRouteTypes['to'];
  params: (id: string) => Record<string, string>;
  // Re-read the stored value after the no-op save (S2).
  read: (id: string) => Promise<Record<string, unknown>>;
  cleanup: (id: string) => Promise<void>;
};

const put = async (path: string, body: object) => {
  const res = await e2eReq.put<{ value: Record<string, unknown> }>(path, body);
  return res.data.value;
};
const get = async (path: string) => {
  const res = await e2eReq.get<{ value: Record<string, unknown> }>(path);
  return res.data.value;
};
const del = (path: string) => e2eReq.delete(path).catch(() => undefined);

const cases: RoundTripCase[] = [
  {
    label: 'route',
    seed: async () => {
      const id = randomId('rt-route');
      const stored = await put(`/routes/${id}`, {
        name: id,
        desc: 'round-trip route',
        uri: `/rt/${id}`,
        labels: { env: 'prod', team: 'gateway' },
        methods: ['GET', 'POST'],
        plugins: { prometheus: {} },
        upstream: {
          type: 'roundrobin',
          nodes: { 'rt1.local:80': 1, 'rt2.local:81': 2 },
          timeout: { connect: 6, send: 6, read: 6 },
        },
      });
      return { id, stored };
    },
    detailTo: '/routes/detail/$id',
    params: (id) => ({ id }),
    read: (id) => get(`/routes/${id}`),
    cleanup: (id) => del(`/routes/${id}`),
  },
  {
    label: 'service',
    seed: async () => {
      const id = randomId('rt-service');
      const stored = await put(`/services/${id}`, {
        name: id,
        desc: 'round-trip service',
        labels: { team: 'x' },
        hosts: ['rt-svc.example.com'],
        enable_websocket: true,
        plugins: { prometheus: {} },
        upstream: {
          type: 'roundrobin',
          nodes: { 'rt-svc.local:80': 1 },
        },
      });
      return { id, stored };
    },
    detailTo: '/services/detail/$id',
    params: (id) => ({ id }),
    read: (id) => get(`/services/${id}`),
    cleanup: (id) => del(`/services/${id}`),
  },
  {
    label: 'upstream',
    seed: async () => {
      const id = randomId('rt-upstream');
      const stored = await put(`/upstreams/${id}`, {
        name: id,
        desc: 'round-trip upstream',
        labels: { tier: 'gold' },
        type: 'roundrobin',
        nodes: { 'rt-up1.local:80': 1, 'rt-up2.local:80': 2 },
        timeout: { connect: 6, send: 6, read: 6 },
        checks: {
          active: {
            type: 'http',
            http_path: '/health',
            healthy: { interval: 2, successes: 2 },
            unhealthy: { interval: 1, http_failures: 3 },
          },
        },
      });
      return { id, stored };
    },
    detailTo: '/upstreams/detail/$id',
    params: (id) => ({ id }),
    read: (id) => get(`/upstreams/${id}`),
    cleanup: (id) => del(`/upstreams/${id}`),
  },
  {
    label: 'consumer',
    // No auth plugin here on purpose: key-auth's `key` is a sensitive field
    // the form does not round-trip (a no-op save re-generates it), so it is
    // excluded for the same reason as SSL/Secret. This case still guards the
    // username/desc/labels round-trip. (The key-auth regeneration on an
    // unrelated edit is noted separately for investigation.)
    seed: async () => {
      const username = randomId('rt_consumer').replace(/-/g, '_');
      const stored = await put('/consumers', {
        username,
        desc: 'round-trip consumer',
        labels: { app: 'y' },
      });
      return { id: username, stored };
    },
    detailTo: '/consumers/detail/$username',
    params: (username) => ({ username }),
    read: (username) => get(`/consumers/${username}`),
    cleanup: (username) => del(`/consumers/${username}`),
  },
  {
    label: 'consumer_group',
    seed: async () => {
      const id = randomId('rt-cg');
      const stored = await put(`/consumer_groups/${id}`, {
        desc: 'round-trip consumer group',
        labels: { grp: 'z' },
        plugins: { prometheus: {} },
      });
      return { id, stored };
    },
    detailTo: '/consumer_groups/detail/$id',
    params: (id) => ({ id }),
    read: (id) => get(`/consumer_groups/${id}`),
    cleanup: (id) => del(`/consumer_groups/${id}`),
  },
];

const noopEditSave = async (page: Page) => {
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await uiHasToastMsg(page, { hasText: /success/i });
};

for (const c of cases) {
  test(`no-op edit-save preserves a ${c.label} unchanged`, async ({ page }) => {
    const { id, stored: before } = await c.seed();
    try {
      await uiGoto(page, c.detailTo, c.params(id));
      await noopEditSave(page);

      const after = await c.read(id);
      expect(
        canonicalize(after),
        `${c.label} changed after a no-op edit-save`
      ).toEqual(canonicalize(before));
    } finally {
      await c.cleanup(id);
    }
  });
}
