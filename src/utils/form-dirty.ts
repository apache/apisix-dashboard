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
import { equals } from 'rambdax';

import { objToUpstreamNodes } from '@/components/form-slice/FormPartUpstream/nodes-conversion';
import type { APISIXType } from '@/types/schema/apisix';

import { deepCleanEmptyKeys, rmDoubleUnderscoreKeys } from './producer';

/** Server-managed timestamps: never a user edit. */
const IGNORED_KEYS = ['create_time', 'update_time'];

/**
 * Canonicalize upstream `nodes` so the object-map form the Admin API stores
 * (`{ "host:port": weight }`) compares equal to the array form the nodes
 * widget produces on mount (`[{ host, port, weight, priority }]`).
 *
 * Without this, every edit page whose upstream stores object-form nodes reads
 * dirty the instant the widget mounts, with zero user input:
 * `formState.defaultValues` keeps the object form (it is seeded straight from
 * the producer, which never rewrites nodes) while `getValues()` returns the
 * array form the widget normalized to. `priority` defaults to 0 on both sides
 * — the widget invents 0, the object form cannot express it at all.
 */
const canonicalizeNodes = (nodes: unknown): unknown => {
  const arr = Array.isArray(nodes)
    ? nodes
    : nodes && typeof nodes === 'object'
      ? objToUpstreamNodes(nodes as APISIXType['UpstreamNodeObj'])
      : null;
  if (!arr) return nodes;
  return arr
    .map((node) =>
      node && typeof node === 'object'
        ? {
            ...(node as Record<string, unknown>),
            priority: (node as Record<string, unknown>).priority ?? 0,
          }
        : node
    )
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
};

/** Rewrite every `nodes` field in place to its canonical, comparable form. */
const canonicalizeNodesDeep = (value: unknown): void => {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(canonicalizeNodesDeep);
    return;
  }
  const obj = value as Record<string, unknown>;
  if ('nodes' in obj) obj.nodes = canonicalizeNodes(obj.nodes);
  Object.values(obj).forEach(canonicalizeNodesDeep);
};

/**
 * Reduce a form value to the shape that decides whether the user has
 * unsaved work.
 *
 * Add pages seed `useForm` with little or nothing, and the widgets
 * normalize `undefined` into `""` / `[]` / `{}` as they mount. Comparing
 * raw values — or trusting react-hook-form's `isDirty`, which is computed
 * from the same raw values — reports 5 of 11 add pages as dirty before the
 * user has typed anything (measured: ssls, secrets, global_rules,
 * plugin_configs, consumer_groups).
 *
 * The `plugins` subtree is deliberately NOT cleaned: an added plugin whose
 * config is still empty is a real edit, and cleaning would erase the only
 * evidence of it. Normalizing `undefined` to `{}` keeps the pristine
 * global_rules/add case (`plugins: {}` on one side, absent on the other)
 * from registering as a change.
 *
 * `deepCleanEmptyKeys` (fast-clean) already leaves `false` and `0` alone by
 * default — only `undefined`, `''`, `NaN`, `{}` and `[]` are stripped — so
 * no extra option is needed to keep booleans like `__checksEnabled` (itself
 * removed a line below by `rmDoubleUnderscoreKeys`, but any other boolean
 * field must survive the clean untouched).
 */
export const normalizeForCompare = (
  value: unknown
): Record<string, unknown> => {
  if (!value || typeof value !== 'object') return { plugins: {} };
  const copy = structuredClone(value) as Record<string, unknown>;
  const plugins = copy.plugins;
  delete copy.plugins;
  IGNORED_KEYS.forEach((key) => delete copy[key]);
  canonicalizeNodesDeep(copy);
  rmDoubleUnderscoreKeys(copy);
  deepCleanEmptyKeys(copy);
  return { ...copy, plugins: plugins ?? {} };
};

/** True when the form holds work the user has not saved. */
export const isFormDirty = (defaults: unknown, values: unknown): boolean =>
  !equals(normalizeForCompare(defaults), normalizeForCompare(values));
