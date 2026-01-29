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

import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Deep equality comparison for objects and arrays
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (a === null || b === null) return a === b;

  if (typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    deepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key]
    )
  );
}

/**
 * Get changed fields between two objects
 */
function getChangedFields(
  original: unknown,
  current: unknown,
  prefix = ''
): string[] {
  if (typeof original !== 'object' || original === null) {
    return deepEqual(original, current) ? [] : [prefix || 'value'];
  }

  if (typeof current !== 'object' || current === null) {
    return [prefix || 'value'];
  }

  const changedFields: string[] = [];
  const allKeys = new Set([
    ...Object.keys(original as object),
    ...Object.keys(current as object),
  ]);

  allKeys.forEach((key) => {
    const origVal = (original as Record<string, unknown>)[key];
    const currVal = (current as Record<string, unknown>)[key];
    const fieldPath = prefix ? `${prefix}.${key}` : key;

    if (!deepEqual(origVal, currVal)) {
      if (
        typeof origVal === 'object' &&
        origVal !== null &&
        typeof currVal === 'object' &&
        currVal !== null
      ) {
        changedFields.push(...getChangedFields(origVal, currVal, fieldPath));
      } else {
        changedFields.push(fieldPath);
      }
    }
  });

  return changedFields;
}

export interface DirtyState<T> {
  /** Original value (from server) */
  original: T | undefined;
  /** Current value (with local edits) */
  current: T | undefined;
  /** Whether current differs from original */
  isDirty: boolean;
  /** List of field paths that have changed */
  changedFields: string[];
  /** Update current value */
  update: (newValue: T) => void;
  /** Reset to a new original value (and clear dirty state) */
  reset: (newOriginal?: T) => void;
  /** Check if a specific field is dirty */
  isFieldDirty: (fieldPath: string) => boolean;
}

/**
 * Hook for tracking dirty state with deep comparison
 *
 * @param initialOriginal - The original value to compare against
 * @returns DirtyState object with current value, isDirty flag, and update functions
 *
 * @example
 * ```tsx
 * const { current, isDirty, update, reset } = useDirtyState(serverData);
 *
 * // Update current value
 * update({ ...current, name: 'New Name' });
 *
 * // Check if dirty
 * if (isDirty) {
 *   // Show warning before navigation
 * }
 *
 * // Reset after save
 * reset(savedData);
 * ```
 */
export function useDirtyState<T>(initialOriginal: T | undefined): DirtyState<T> {
  const [original, setOriginal] = useState<T | undefined>(initialOriginal);
  const [current, setCurrent] = useState<T | undefined>(initialOriginal);

  // Use ref to track if we've initialized with initialOriginal
  const initializedRef = useRef(false);

  // Update original when initialOriginal changes (e.g., after data fetch)
  if (initialOriginal !== undefined && !initializedRef.current) {
    initializedRef.current = true;
    setOriginal(initialOriginal);
    setCurrent(initialOriginal);
  }

  const isDirty = useMemo(
    () => !deepEqual(original, current),
    [original, current]
  );

  const changedFields = useMemo(
    () => (isDirty ? getChangedFields(original, current) : []),
    [original, current, isDirty]
  );

  const update = useCallback((newValue: T) => {
    setCurrent(newValue);
  }, []);

  const reset = useCallback((newOriginal?: T) => {
    if (newOriginal !== undefined) {
      setOriginal(newOriginal);
      setCurrent(newOriginal);
    } else {
      setCurrent(original);
    }
  }, [original]);

  const isFieldDirty = useCallback(
    (fieldPath: string) => changedFields.includes(fieldPath),
    [changedFields]
  );

  return {
    original,
    current,
    isDirty,
    changedFields,
    update,
    reset,
    isFieldDirty,
  };
}

/**
 * Hook for tracking dirty state of a string (e.g., JSON editor)
 * Simpler version that just compares strings
 */
export function useStringDirtyState(initialValue: string): DirtyState<string> {
  const [original, setOriginal] = useState(initialValue);
  const [current, setCurrent] = useState(initialValue);

  const isDirty = original !== current;

  const update = useCallback((newValue: string) => {
    setCurrent(newValue);
  }, []);

  const reset = useCallback((newOriginal?: string) => {
    if (newOriginal !== undefined) {
      setOriginal(newOriginal);
      setCurrent(newOriginal);
    } else {
      setCurrent(original);
    }
  }, [original]);

  return {
    original,
    current,
    isDirty,
    changedFields: isDirty ? ['value'] : [],
    update,
    reset,
    isFieldDirty: () => isDirty,
  };
}
