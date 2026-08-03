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
import { buildUrl, METHODS_WITH_BODY, type TestRequest } from './util';

export type LiveResult =
  | {
      ok: true;
      status: number;
      statusText: string;
      durationMs: number;
      headers: [string, string][];
      body: string;
    }
  | { ok: false; kind: 'blocked' };

export const sendLive = async (
  req: TestRequest,
  gatewayUrl: string
): Promise<LiveResult> => {
  const url = buildUrl(gatewayUrl.trim(), req.path);
  const headers: Record<string, string> = {};
  for (const h of req.headers) {
    if (h.name.trim()) headers[h.name] = h.value;
  }
  const hasBody = req.body.trim() !== '' && METHODS_WITH_BODY.has(req.method);
  const start = performance.now();
  try {
    const resp = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
    });
    const durationMs = Math.round(performance.now() - start);
    const body = await resp.text();
    const respHeaders: [string, string][] = [];
    resp.headers.forEach((v, k) => respHeaders.push([k, v]));
    return {
      ok: true,
      status: resp.status,
      statusText: resp.statusText,
      durationMs,
      headers: respHeaders,
      body,
    };
  } catch {
    // CORS-blocked, unreachable, and network errors are indistinguishable
    // here (opaque TypeError). Collapse to one honest fallback.
    return { ok: false, kind: 'blocked' };
  }
};
