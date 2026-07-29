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

/** Placeholder shown in place of a secret. Fixed width: the length of a
 *  secret is itself a clue to its strength, so it must not leak. */
export const REDACTED = '••••••';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const redactPath = (node: unknown, segments: string[]): unknown => {
  if (segments.length === 0) return REDACTED;

  // The gateway emits flat dotted paths even when a segment crosses an
  // array (kafka-logger `brokers.sasl_config.password`, ai-proxy-multi
  // `instances.auth.header`), so an array means "apply to every element".
  if (Array.isArray(node)) {
    return node.map((item) => redactPath(item, segments));
  }

  if (!isPlainObject(node)) return node;

  const [head, ...rest] = segments;
  if (!(head in node)) return node;

  return { ...node, [head]: redactPath(node[head], rest) };
};

/**
 * Replace every value named by `paths` with {@link REDACTED}.
 *
 * `paths` come from the plugin schema's `encrypt_fields`, i.e. the gateway
 * decides what is sensitive — the dashboard keeps no list of its own. Since
 * that arrives over the network as `unknown` in practice, a non-array is
 * ignored and any non-string element is skipped, rather than trusting the
 * declared `string[]` shape.
 * Returns a new value; the input is left intact so edit mode still has the
 * real config.
 */
export const redactByPaths = (config: unknown, paths: unknown): unknown => {
  if (!Array.isArray(paths)) return config;

  return paths.reduce<unknown>(
    (acc, path) =>
      typeof path === 'string' ? redactPath(acc, path.split('.')) : acc,
    config
  );
};
