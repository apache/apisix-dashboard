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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { ZodObject, type ZodRawShape, type ZodTypeAny } from 'zod';

import { APISIX } from '.';

// Cheapest structural guard for the hand-written zod transcription of the
// Admin API (#3417): the zod layer must be *looser or equal* to the gateway's
// own schema, i.e. it must not reject what the gateway accepts. That whole
// class of "form rejects a valid config" bugs (#3146/#3147/#3362/#3376/#3395)
// comes from a field the gateway has that the zod schema silently drops.
//
// The gateway's per-resource schema is snapshotted under __fixtures__/gateway
// (refresh with `pnpm refresh:gateway-schema` on APISIX version bumps). For
// each top-level property the gateway defines this asserts, against the merged
// dashboard schema:
//   - field coverage: the zod schema knows the field (else the resolver strips
//     it on submit);
//   - enum: the zod field accepts every value the gateway's enum allows.
//
// (Required-ness is intentionally NOT compared: the dashboard's full read
// schema requires the server-managed id/create_time/update_time that the
// gateway write schema does not, and the write path uses Post/Put variants
// that omit them, so a required-direction check against the full schema only
// produces false positives.)
//
// Fields the dashboard deliberately does not accept live in ALLOWLIST with a
// reason — never a silent omission. A stale allowlist entry (one zod now
// covers) also fails, forcing cleanup. Scope is top-level only; nested objects
// and plugin configs (passthrough) are out of scope.

const FIXTURE_DIR = fileURLToPath(new URL('./__fixtures__/gateway/', import.meta.url));

type GatewayProperty = {
  enum?: unknown[];
  type?: string;
  anyOf?: { type?: string }[];
  properties?: Record<string, GatewayProperty>;
};

type GatewaySchema = {
  properties?: Record<string, GatewayProperty>;
  required?: string[];
};

const loadFixture = (resource: string): GatewaySchema =>
  JSON.parse(readFileSync(`${FIXTURE_DIR}${resource}.json`, 'utf8'));

// gateway resource name -> dashboard zod schema (the full stored shape).
const SCHEMAS: Record<string, ZodTypeAny> = {
  route: APISIX.Route,
  service: APISIX.Service,
  upstream: APISIX.Upstream,
  consumer: APISIX.Consumer,
  ssl: APISIX.SSL,
  global_rule: APISIX.GlobalRule,
  plugin_config: APISIX.PluginConfig,
  consumer_group: APISIX.ConsumerGroup,
  stream_route: APISIX.StreamRoute,
  proto: APISIX.Proto,
  credential: APISIX.Credential,
};

// Gateway top-level fields the dashboard's zod schema does not model. Every
// entry carries a reason: either an intentional non-support decision, or a
// KNOWN GAP flagged for a follow-up fix — never a silent omission.
const ALLOWLIST: Record<string, Record<string, string>> = {
  route: {},
  service: {},
  upstream: {
    create_time: 'server-managed timestamp not modelled on the upstream schema (write path omits it; read-only display only)',
    update_time: 'server-managed timestamp not modelled on the upstream schema (write path omits it; read-only display only)',
  },
  consumer: {
    id: 'consumers are keyed by username in the dashboard; the gateway id is not modelled',
  },
  ssl: {},
  global_rule: {},
  plugin_config: {},
  consumer_group: {
    name: 'the dashboard consumer-group form exposes id/desc/labels/plugins, not a separate name field',
  },
  stream_route: {},
  proto: {
    name: 'the dashboard proto form models content/id only',
    labels: 'the dashboard proto form models content/id only',
    desc: 'the dashboard proto form models content/id only',
  },
  credential: {
    name: 'credentials are keyed by id in the dashboard; the gateway name is not modelled',
  },
};

// Enum VALUES a covered field is allowed not to accept, as `field="value"`.
// Same rule: each carries a reason (intentional or a flagged gap).
const ENUM_ALLOWLIST: Record<string, Record<string, string>> = {
  upstream: {
    'scheme="kafka"':
      'KNOWN GAP — the dashboard upstream `scheme` enum omits "kafka"; a kafka-scheme upstream cannot be created via the form. Flagged for a follow-up fix (also needs UI support), tracked separately.',
  },
};

/** Unwrap ZodEffects/optional/default wrappers down to the underlying object. */
const toObject = (schema: ZodTypeAny): ZodObject<ZodRawShape> => {
  let cur: ZodTypeAny = schema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = () => (cur as any)._def;
  while (
    def()?.typeName === 'ZodEffects' ||
    def()?.typeName === 'ZodOptional' ||
    def()?.typeName === 'ZodDefault'
  ) {
    cur = def().typeName === 'ZodEffects' ? def().schema : def().innerType;
  }
  return cur as ZodObject<ZodRawShape>;
};

describe('gateway contract: zod is looser-or-equal to the APISIX schema', () => {
  it.each(Object.keys(SCHEMAS))('%s', (resource) => {
    const gateway = loadFixture(resource);
    const properties = gateway.properties ?? {};
    const shape = toObject(SCHEMAS[resource]).shape;
    const zodKeys = new Set(Object.keys(shape));
    const allow = ALLOWLIST[resource] ?? {};
    const enumAllow = ENUM_ALLOWLIST[resource] ?? {};

    const notCovered: string[] = [];
    const enumGaps: string[] = [];

    for (const [field, spec] of Object.entries(properties)) {
      if (!zodKeys.has(field)) {
        if (!(field in allow)) notCovered.push(field);
        continue;
      }
      const fieldSchema = shape[field] as ZodTypeAny;
      // enum: every gateway-allowed value must pass the zod field.
      if (Array.isArray(spec.enum)) {
        for (const v of spec.enum) {
          const key = `${field}=${JSON.stringify(v)}`;
          if (!fieldSchema.safeParse(v).success && !(key in enumAllow)) {
            enumGaps.push(key);
          }
        }
      }
    }

    // Stale allowlist: a field-coverage exemption the zod schema now covers,
    // or an exemption for a field the gateway no longer defines.
    const staleAllow = Object.keys(allow).filter(
      (f) => zodKeys.has(f) || !(f in properties)
    );

    expect(
      { notCovered, enumGaps, staleAllow },
      `${resource}: zod is stricter than the gateway (or the allowlist is stale)`
    ).toEqual({ notCovered: [], enumGaps: [], staleAllow: [] });
  });
});

const isIdSchema = (spec: GatewayProperty) =>
  Array.isArray(spec.anyOf) &&
  spec.anyOf.some((t) => t.type === 'integer') &&
  spec.anyOf.some((t) => t.type === 'string');

const collectIdGaps = (
  properties: Record<string, GatewayProperty>,
  shape: ZodRawShape,
  path = ''
): { rejectsInteger: string[]; keepsInteger: string[] } => {
  const rejectsInteger: string[] = [];
  const keepsInteger: string[] = [];
  for (const [field, spec] of Object.entries(properties)) {
    if (!(field in shape)) continue;
    const fieldSchema = shape[field] as ZodTypeAny;
    const at = path ? `${path}.${field}` : field;
    if (isIdSchema(spec)) {
      const parsed = fieldSchema.safeParse(10001);
      if (!parsed.success) rejectsInteger.push(at);
      else if (parsed.data !== '10001') keepsInteger.push(at);
    } else if (spec.properties) {
      const nested = toObject(fieldSchema);
      if (!(nested instanceof ZodObject)) continue;
      const gaps = collectIdGaps(spec.properties, nested.shape, at);
      rejectsInteger.push(...gaps.rejectsInteger);
      keepsInteger.push(...gaps.keepsInteger);
    }
  }
  return { rejectsInteger, keepsInteger };
};

describe('gateway contract: id-typed fields accept the integer form', () => {
  it.each(Object.keys(SCHEMAS))('%s', (resource) => {
    const properties = loadFixture(resource).properties ?? {};
    const shape = toObject(SCHEMAS[resource]).shape;

    expect(
      collectIdGaps(properties, shape),
      `${resource}: an id-typed field rejects the integer form the gateway accepts, or does not normalize it to a string`
    ).toEqual({ rejectsInteger: [], keepsInteger: [] });
  });
});
