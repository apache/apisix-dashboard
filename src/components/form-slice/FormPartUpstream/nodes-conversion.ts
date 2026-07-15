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

const isValidPort = (n: number) => Number.isInteger(n) && n >= 1 && n <= 65535;

/**
 * Parse an object-form node key into host + optional port.
 *
 * Gateway contract (verified against a live Admin API): keys may be
 * "host", "host:port", "[v6]", "[v6]:port" or a bare IPv6 like "::1";
 * array-form nodes accept a MISSING port (the scheme decides at runtime)
 * but reject an unbracketed IPv6 host — so a bare IPv6 key must come out
 * bracketed, and a missing port must stay missing (never invented).
 */
export const parseNodeKey = (key: string): { host: string; port?: number } => {
  if (key.startsWith('[')) {
    const end = key.indexOf(']');
    if (end !== -1) {
      const host = key.slice(0, end + 1);
      const rest = key.slice(end + 1);
      if (rest.startsWith(':')) {
        const port = Number(rest.slice(1));
        if (isValidPort(port)) return { host, port };
      }
      return { host };
    }
  }
  const first = key.indexOf(':');
  const last = key.lastIndexOf(':');
  // two or more colons without brackets: a bare IPv6 key
  if (first !== -1 && first !== last) return { host: `[${key}]` };
  if (last !== -1) {
    const port = Number(key.slice(last + 1));
    if (isValidPort(port)) return { host: key.slice(0, last), port };
  }
  return { host: key };
};

export const objToUpstreamNodes = (data: APISIXType['UpstreamNodeObj']) => {
  return Object.entries(data).map(([key, val]) => {
    const d: APISIXType['UpstreamNode'] = {
      ...parseNodeKey(key),
      weight: val,
    };
    return d;
  });
};
