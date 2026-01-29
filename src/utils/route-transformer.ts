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

/**
 * Route Transformer Module
 *
 * Provides symmetric (reversible) transformations between:
 * - API format: What the server sends/receives
 * - Internal format: Canonical representation (single source of truth)
 * - Form format: What React Hook Form uses
 * - JSON View format: What user sees in JSON editor
 *
 * Key principle: vars is ALWAYS an array in internal/API/JSON formats,
 * but a JSON string in form format (for Monaco editor compatibility)
 */

import { produce } from 'immer';
import { isNotEmpty } from 'rambdax';

import type { RoutePutType } from '@/components/form-slice/FormPartRoute/schema';
import type { APISIXType } from '@/types/schema/apisix';

import { deepCleanEmptyKeys, rmDoubleUnderscoreKeys } from './producer';

/**
 * Internal canonical format for Route
 * vars is always an array, never a string
 */
export type RouteInternal = Omit<APISIXType['Route'], 'vars'> & {
  vars?: unknown[];
  // Form-specific fields (prefixed with __)
  __checksEnabled?: boolean;
  __checksPassiveEnabled?: boolean;
};

/**
 * Transform API data to internal format
 * This is essentially an identity transformation since API already has vars as array
 */
export function apiToInternal(api: APISIXType['Route']): RouteInternal {
  return {
    ...api,
    vars: api.vars as unknown[] | undefined,
  };
}

/**
 * Transform internal format to API format
 * Removes form-specific fields (prefixed with __) and cleans empty keys
 */
export function internalToApi(internal: RouteInternal): APISIXType['Route'] {
  return produce(internal, (draft) => {
    // Remove __ prefixed fields
    rmDoubleUnderscoreKeys(draft);

    // Remove timestamps (server manages these)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mutableDraft = draft as any;
    delete mutableDraft.create_time;
    delete mutableDraft.update_time;

    // Remove upstream if service_id or upstream_id is set
    if ((draft.service_id || draft.upstream_id) && isNotEmpty(draft.upstream)) {
      delete draft.upstream;
    }

    // Clean empty keys
    deepCleanEmptyKeys(draft);
  }) as APISIXType['Route'];
}

/**
 * Transform internal format to form format
 * Key change: vars array is stringified for Monaco editor
 */
export function internalToForm(internal: RouteInternal): RoutePutType {
  // Deep clone to avoid mutation issues with frozen objects
  const cloned = JSON.parse(JSON.stringify(internal)) as RoutePutType;

  // Stringify vars array for form editor
  if (cloned.vars && Array.isArray(cloned.vars)) {
    cloned.vars = JSON.stringify(cloned.vars);
  }

  // Add form-specific upstream checks flags
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutableCloned = cloned as any;
  const upstream = internal.upstream;
  if (upstream) {
    mutableCloned.__checksEnabled = !!upstream.checks && isNotEmpty(upstream.checks);
    mutableCloned.__checksPassiveEnabled =
      !!upstream.checks?.passive && isNotEmpty(upstream.checks.passive);
  }

  return cloned;
}

/**
 * Transform form format to internal format
 * Key change: vars string is parsed back to array
 */
export function formToInternal(form: RoutePutType): RouteInternal {
  // Deep clone to avoid mutation issues with frozen objects
  const cloned = JSON.parse(JSON.stringify(form)) as RouteInternal;

  // Parse vars string back to array
  if (cloned.vars && typeof cloned.vars === 'string') {
    try {
      cloned.vars = JSON.parse(cloned.vars as string);
    } catch {
      // Keep as-is if parse fails (will be caught by validation)
      cloned.vars = [];
    }
  }

  return cloned;
}

/**
 * Transform internal format to JSON string for display
 * Shows vars as natural array (not stringified)
 */
export function internalToJson(internal: RouteInternal): string {
  // Deep clone to avoid mutation issues with frozen objects
  const cloned = JSON.parse(JSON.stringify(internal));
  // Remove form-specific fields (__ prefixed)
  rmDoubleUnderscoreKeys(cloned);

  return JSON.stringify(cloned, null, 2);
}

/**
 * Parse JSON string to internal format
 */
export function jsonToInternal(json: string): RouteInternal {
  const parsed = JSON.parse(json);

  // Ensure vars is an array if present
  if (parsed.vars && !Array.isArray(parsed.vars)) {
    // If someone pastes stringified vars, try to parse it
    if (typeof parsed.vars === 'string') {
      try {
        parsed.vars = JSON.parse(parsed.vars);
      } catch {
        parsed.vars = [];
      }
    }
  }

  return parsed as RouteInternal;
}

// ============================================
// Composed convenience functions
// ============================================

/**
 * API → Form (for loading data into form)
 */
export function apiToForm(api: APISIXType['Route']): RoutePutType {
  return internalToForm(apiToInternal(api));
}

/**
 * Form → API (for saving form data)
 */
export function formToApi(form: RoutePutType): APISIXType['Route'] {
  return internalToApi(formToInternal(form));
}

/**
 * API → JSON string (for JSON view display)
 */
export function apiToJson(api: APISIXType['Route']): string {
  return internalToJson(apiToInternal(api));
}

/**
 * JSON string → API (for saving from JSON view)
 */
export function jsonToApi(json: string): APISIXType['Route'] {
  return internalToApi(jsonToInternal(json));
}

/**
 * Form → JSON string (for switching to JSON view)
 */
export function formToJson(form: RoutePutType): string {
  return internalToJson(formToInternal(form));
}

/**
 * JSON string → Form (for switching to form view)
 */
export function jsonToForm(json: string): RoutePutType {
  return internalToForm(jsonToInternal(json));
}

// ============================================
// Validation helpers
// ============================================

/**
 * Validate that a transformation round-trip preserves data
 * Useful for debugging transformation issues
 */
export function validateRoundTrip(
  original: APISIXType['Route']
): { isValid: boolean; diff?: string } {
  try {
    const internal = apiToInternal(original);
    const form = internalToForm(internal);
    const backToInternal = formToInternal(form);
    const backToApi = internalToApi(backToInternal);

    // Compare original and round-tripped (ignoring timestamps and empty fields)
    const originalClean = produce(original, (draft) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mutableDraft = draft as any;
      delete mutableDraft.create_time;
      delete mutableDraft.update_time;
      deepCleanEmptyKeys(draft);
    });

    const roundTrippedClean = produce(backToApi, (draft) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mutableDraft = draft as any;
      delete mutableDraft.create_time;
      delete mutableDraft.update_time;
      deepCleanEmptyKeys(draft);
    });

    const isValid =
      JSON.stringify(originalClean) === JSON.stringify(roundTrippedClean);

    if (!isValid) {
      return {
        isValid: false,
        diff: `Original: ${JSON.stringify(originalClean)}\nRound-tripped: ${JSON.stringify(roundTrippedClean)}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      diff: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
