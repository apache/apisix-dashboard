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
import type { APISIXType } from '@/types/schema/apisix';

export type TestHeader = { name: string; value: string };
export type TestRequest = {
  method: string;
  path: string;
  headers: TestHeader[];
  body: string;
};

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
] as const;

export const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

type RouteLike = Pick<
  APISIXType['Route'],
  'uri' | 'uris' | 'host' | 'hosts' | 'methods'
>;

export const deriveFromRoute = (route: RouteLike): TestRequest => {
  const methods = route.methods ?? [];
  const method = methods.length > 0 ? methods[0] : 'GET';
  const path = route.uri ?? route.uris?.[0] ?? '/';
  const hosts = route.hosts ?? (route.host ? [route.host] : []);
  const headers: TestHeader[] =
    hosts.length > 0 ? [{ name: 'Host', value: hosts[0] }] : [];
  return { method, path, headers, body: '' };
};

export const GATEWAY_URL_PLACEHOLDER = 'http://<gateway-host>:<port>';

export const buildUrl = (gatewayUrl: string, path: string): string => {
  const base = gatewayUrl.trim().replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};

const shellSingleQuote = (s: string): string =>
  `'${s.replace(/'/g, '\'\\\'\'')}'`;

export const toCurl = (req: TestRequest, gatewayUrl: string): string => {
  const base = gatewayUrl.trim() || GATEWAY_URL_PLACEHOLDER;
  const url = buildUrl(base, req.path);
  const lines = [`curl -X ${req.method} ${shellSingleQuote(url)}`];
  for (const h of req.headers) {
    if (!h.name.trim()) continue;
    lines.push(`  -H ${shellSingleQuote(`${h.name}: ${h.value}`)}`);
  }
  if (req.body.trim() && METHODS_WITH_BODY.has(req.method)) {
    lines.push(`  --data-raw ${shellSingleQuote(req.body)}`);
  }
  return lines.join(' \\\n');
};
