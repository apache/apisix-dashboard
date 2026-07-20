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

export const labelsToTags = (value: unknown): string[] => {
  // Defensive: ensure value is a plain object (not array or null)
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value).map(([key, val]) => `${key}:${val}`);
};

/**
 * Parse NEW user input on the FIRST colon: keys cannot contain colons via
 * the dashboard, values can (registry addresses, times, ratios — the
 * Admin API accepts and stores them). Key and value must both be
 * non-empty: the Admin API rejects empty ones with 400.
 */
export const parseLabelTag = (tag: string): [string, string] | null => {
  const i = tag.indexOf(':');
  if (i <= 0 || i === tag.length - 1) return null;
  return [tag.slice(0, i), tag.slice(i + 1)];
};

/**
 * Convert the TagsInput strings back into a labels object. A string that
 * matches an existing entry's joined `key:value` form keeps that entry
 * VERBATIM — editing other tags can never rewrite a stored label (the
 * Admin API also accepts colon-in-KEY labels, which a re-parse would
 * silently turn into a different pair). Only genuinely new strings are
 * parsed. Returns null when a new string is not a valid `key:value`.
 */
export const tagsToLabels = (
  tags: string[],
  current: unknown
): APISIXType['Labels'] | null => {
  const existing = new Map<string, [string, string]>();
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    for (const [key, val] of Object.entries(
      current as Record<string, unknown>
    )) {
      const joined = `${key}:${val}`;
      if (!existing.has(joined)) existing.set(joined, [key, String(val)]);
    }
  }
  const obj: APISIXType['Labels'] = {};
  for (const tag of tags) {
    const pair = existing.get(tag) ?? parseLabelTag(tag);
    if (!pair) return null;
    obj[pair[0]] = pair[1];
  }
  return obj;
};
