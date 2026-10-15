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

import { produceRoute } from '@/components/form-slice/FormPartRoute/util';
import { produceStreamRoute } from '@/components/form-slice/FormPartStreamRoute/util';
import { produceRmUpstreamWhenHas } from '@/utils/form-producer';
import { pipeProduce } from '@/utils/producer';

import { isUntouchedInlineUpstream, produceRmEmptyUpstreamFields } from './util';

// Regression for apache/apisix-dashboard#3395.
//
// The inline upstream section of the route / service / stream-route forms is
// always rendered, and its Select / Switch / JSON widgets register a value
// the moment they mount: scheme=http, type=roundrobin, hash_on=vars,
// pass_host=pass, tls.verify=false, discovery_args={}. react-hook-form keeps
// those in the submit values, so a form whose upstream section the user
// never opened still submitted `upstream: { scheme, type, hash_on, ... }` —
// an upstream with neither nodes nor discovery, which the Admin API rejects:
//   property "upstream" validation failed: value should match only one
//   schema, but matches none
// A plugins-only route (the public-api example) could not be created, and a
// route created that way through the Admin API could not be edit-saved.
//
// `vite dev` and the NODE_ENV=test e2e build never showed this: under React
// StrictMode the double-invoked controller effects run the shouldUnregister
// cleanup, which wipes the mount-time values again. Only a production build
// (the one shipped inside APISIX) sends them.

/** exactly what react-hook-form holds for a never-opened upstream section */
const untouchedInlineUpstream = () => ({
  name: '',
  desc: '',
  labels: {},
  service_name: '',
  discovery_type: '',
  discovery_args: {},
  nodes: undefined,
  scheme: 'http',
  type: 'roundrobin',
  hash_on: 'vars',
  key: '',
  pass_host: 'pass',
  upstream_host: '',
  retries: undefined,
  retry_timeout: undefined,
  timeout: { connect: undefined, send: undefined, read: undefined },
  keepalive_pool: {
    size: undefined,
    idle_timeout: undefined,
    requests: undefined,
  },
  tls: { verify: false, client_cert: '', client_key: '', client_cert_id: '' },
});

/** the whole Add Route form, submitted with only name, uri and a plugin */
const pluginsOnlyRouteForm = () => ({
  name: 'metrics',
  desc: '',
  labels: {},
  status: 1,
  priority: 0,
  methods: [],
  enable_websocket: false,
  uri: '/apisix/prometheus/metrics',
  uris: [],
  host: '',
  hosts: [],
  remote_addr: '',
  remote_addrs: [],
  vars: '',
  filter_func: '',
  service_id: '',
  timeout: { connect: undefined, send: undefined, read: undefined },
  upstream_id: '',
  upstream: untouchedInlineUpstream(),
  plugin_config_id: '',
  plugins: { 'public-api': {} },
  __checksEnabled: false,
  __checksPassiveEnabled: false,
});

describe('isUntouchedInlineUpstream', () => {
  it('is true for the values a never-opened upstream section holds', () => {
    expect(isUntouchedInlineUpstream(untouchedInlineUpstream())).toBe(true);
  });

  it('is true when the widgets left only their defaults after cleaning', () => {
    expect(
      isUntouchedInlineUpstream({
        scheme: 'http',
        type: 'roundrobin',
        hash_on: 'vars',
        pass_host: 'pass',
        tls: { verify: false },
        discovery_args: {},
        nodes: [],
      })
    ).toBe(true);
  });

  it.each([
    ['array nodes', { nodes: [{ host: 'a.local', port: 80, weight: 1 }] }],
    ['object nodes', { nodes: { 'a.local:80': 1 } }],
    // a node row the user added but has not filled in yet is still input —
    // the Admin API must be the one to reject the empty host
    ['an empty node row', { nodes: [{ host: '', port: 80, weight: 1 }] }],
    ['discovery', { discovery_type: 'dns', service_name: 'svc' }],
    ['a non-default scheme', { scheme: 'https' }],
    ['a non-default balancer', { type: 'chash' }],
    ['a non-default hash_on', { hash_on: 'header' }],
    ['a non-default pass_host', { pass_host: 'node' }],
    ['tls.verify switched on', { tls: { verify: true } }],
    ['a client cert', { tls: { verify: false, client_cert: 'cert' } }],
    ['a name', { name: 'my-upstream' }],
    ['labels', { labels: { env: 'prod' } }],
    ['a zero retries count', { retries: 0 }],
    ['a timeout', { timeout: { connect: 3 } }],
    ['a keepalive pool size', { keepalive_pool: { size: 320 } }],
    ['health checks', { checks: { active: { type: 'http' } } }],
    ['discovery args', { discovery_args: { namespace: 'x' } }],
  ])('is false once the user supplied %s', (_, touched) => {
    expect(
      isUntouchedInlineUpstream({ ...untouchedInlineUpstream(), ...touched })
    ).toBe(false);
  });

  it.each([undefined, null, '', 'nodes', 1, []])(
    'is false for a non-object value (%s)',
    (value) => {
      expect(isUntouchedInlineUpstream(value)).toBe(false);
    }
  );

  it('does not mutate its argument', () => {
    const upstream = untouchedInlineUpstream();
    const before = JSON.stringify(upstream);
    isUntouchedInlineUpstream(upstream);
    expect(JSON.stringify(upstream)).toBe(before);
  });
});

describe('produceRmEmptyUpstreamFields', () => {
  it('drops an inline upstream the user never touched', () => {
    const out = produceRmEmptyUpstreamFields({
      uri: '/x',
      upstream: untouchedInlineUpstream(),
    });
    expect(out).not.toHaveProperty('upstream');
    expect(out.uri).toBe('/x');
  });

  it('keeps an inline upstream with nodes, defaults included', () => {
    const out = produceRmEmptyUpstreamFields({
      upstream: {
        ...untouchedInlineUpstream(),
        nodes: [{ host: 'a.local', port: 80, weight: 1 }],
      },
    });
    expect(out.upstream).toMatchObject({
      scheme: 'http',
      type: 'roundrobin',
      hash_on: 'vars',
      pass_host: 'pass',
      nodes: [{ host: 'a.local', port: 80, weight: 1 }],
    });
  });

  it('keeps an inline upstream that only has discovery', () => {
    const out = produceRmEmptyUpstreamFields({
      upstream: {
        ...untouchedInlineUpstream(),
        discovery_type: 'dns',
        service_name: 'svc.local',
      },
    });
    expect(out.upstream).toMatchObject({
      discovery_type: 'dns',
      service_name: 'svc.local',
    });
  });

  it('keeps a touched but incomplete inline upstream for the Admin API to judge', () => {
    // silently dropping it would discard what the user typed (#3417)
    const out = produceRmEmptyUpstreamFields({
      upstream: { ...untouchedInlineUpstream(), scheme: 'https' },
    });
    expect(out.upstream).toMatchObject({ scheme: 'https' });
  });

  it('leaves the root-level upstream form (upstreams page) alone', () => {
    // the upstreams page submits these fields at the root, not under
    // `upstream`; whether that is a valid upstream is the Admin API's call
    const out = produceRmEmptyUpstreamFields(untouchedInlineUpstream());
    expect(out).toMatchObject({ scheme: 'http', type: 'roundrobin' });
  });
});

describe('submit pipelines with an untouched inline upstream', () => {
  it('route add/edit: sends a plugins-only route without any upstream', () => {
    const body = pipeProduce(
      produceRmEmptyUpstreamFields,
      produceRoute
    )(pluginsOnlyRouteForm()) as Record<string, unknown>;
    expect(body).not.toHaveProperty('upstream');
    expect(body).not.toHaveProperty('upstream_id');
    expect(body).not.toHaveProperty('service_id');
    expect(body).toMatchObject({
      name: 'metrics',
      uri: '/apisix/prometheus/metrics',
      plugins: { 'public-api': {} },
    });
  });

  it('route: a filled inline upstream still goes through', () => {
    const form = pluginsOnlyRouteForm();
    form.upstream.nodes = [
      { host: 'a.local', port: 80, weight: 1 },
    ] as never;
    const body = pipeProduce(
      produceRmEmptyUpstreamFields,
      produceRoute
    )(form) as { upstream?: Record<string, unknown> };
    expect(body.upstream).toMatchObject({
      scheme: 'http',
      nodes: [{ host: 'a.local', port: 80, weight: 1 }],
    });
  });

  it('service add/edit: a service with no upstream at all is sent without one', () => {
    const body = pipeProduce(
      produceRmUpstreamWhenHas('upstream_id'),
      produceRmEmptyUpstreamFields
    )({
      name: 'svc',
      upstream_id: '',
      upstream: untouchedInlineUpstream(),
      plugins: {},
    }) as Record<string, unknown>;
    expect(body).not.toHaveProperty('upstream');
    expect(body.name).toBe('svc');
  });

  it('stream route add/edit: an untouched inline upstream is not sent', () => {
    const body = produceStreamRoute({
      server_addr: '127.0.0.1',
      server_port: 9100,
      upstream_id: '',
      service_id: '',
      upstream: untouchedInlineUpstream(),
    } as never) as Record<string, unknown>;
    expect(body).not.toHaveProperty('upstream');
    expect(body.server_port).toBe(9100);
  });
});
