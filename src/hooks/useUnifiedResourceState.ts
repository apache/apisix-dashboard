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

import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ViewMode = 'form' | 'json';

export interface TransformConfig<TInternal, TForm, TApi> {
  /** Transform API data to internal format */
  apiToInternal: (api: TApi) => TInternal;
  /** Transform internal format to API format */
  internalToApi: (internal: TInternal) => TApi;
  /** Transform internal format to form format */
  internalToForm: (internal: TInternal) => TForm;
  /** Transform form format to internal format */
  formToInternal: (form: TForm) => TInternal;
  /** Transform internal format to JSON string */
  internalToJson: (internal: TInternal) => string;
  /** Transform JSON string to internal format */
  jsonToInternal: (json: string) => TInternal;
}

export interface UnifiedResourceState<TForm, TApi> {
  // ============================================
  // Server State
  // ============================================
  /** Original data from server */
  serverData: TApi | undefined;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether there was an error loading */
  isError: boolean;
  /** Refetch data from server */
  refetch: () => Promise<void>;

  // ============================================
  // Draft State
  // ============================================
  /** Current form draft (with local edits) */
  formDraft: TForm | undefined;
  /** Current JSON draft (with local edits) */
  jsonDraft: string;

  // ============================================
  // Dirty Tracking
  // ============================================
  /** Whether form view has unsaved changes */
  isFormDirty: boolean;
  /** Whether JSON view has unsaved changes */
  isJsonDirty: boolean;
  /** Whether either view has unsaved changes */
  isDirty: boolean;

  // ============================================
  // View Mode
  // ============================================
  /** Currently active view */
  activeView: ViewMode;
  /** Whether currently in read-only mode */
  readOnly: boolean;

  // ============================================
  // Actions
  // ============================================
  /** Switch to a different view (syncs data first) */
  setActiveView: (view: ViewMode) => void;
  /** Toggle read-only mode */
  setReadOnly: (readOnly: boolean) => void;
  /** Update form draft */
  updateFormDraft: (data: TForm) => void;
  /** Update JSON draft */
  updateJsonDraft: (json: string) => void;
  /** Sync form changes to JSON (call before switching to JSON view) */
  syncFormToJson: () => void;
  /** Sync JSON changes to form (call before switching to form view) */
  syncJsonToForm: () => void;
  /** Reset all drafts to server state */
  resetDrafts: () => void;
  /** Save current active view's data */
  save: () => Promise<boolean>;

  // ============================================
  // Mutation State
  // ============================================
  /** Whether save is in progress */
  isSaving: boolean;
  /** Last save error */
  saveError: Error | null;
}

export interface UseUnifiedResourceStateOptions<TInternal, TForm, TApi> {
  /** React Query query result */
  query: UseQueryResult<{ value: TApi }, Error>;
  /** React Query mutation result */
  mutation: UseMutationResult<unknown, Error, TApi>;
  /** Transformation functions */
  transforms: TransformConfig<TInternal, TForm, TApi>;
  /** Callback after successful save */
  onSaveSuccess?: () => void;
}

/**
 * Unified Resource State Hook
 *
 * Provides a single source of truth for resource editing across Form and JSON views.
 * Handles:
 * - Server state management (via React Query)
 * - Local draft state for both views
 * - Bidirectional synchronization between views
 * - Dirty state tracking
 * - Save operations
 *
 * @example
 * ```tsx
 * const unifiedState = useUnifiedResourceState({
 *   query: routeQuery,
 *   mutation: putRouteMutation,
 *   transforms: {
 *     apiToInternal,
 *     internalToApi,
 *     internalToForm,
 *     formToInternal,
 *     internalToJson,
 *     jsonToInternal,
 *   },
 * });
 * ```
 */
// Helper to deep clone and unfreeze objects from Immer
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export function useUnifiedResourceState<TInternal, TForm, TApi>(
  options: UseUnifiedResourceStateOptions<TInternal, TForm, TApi>
): UnifiedResourceState<TForm, TApi> {
  const { query, mutation, transforms, onSaveSuccess } = options;

  // ============================================
  // Local State
  // ============================================
  const [activeView, setActiveViewState] = useState<ViewMode>('form');
  const [readOnly, setReadOnly] = useState(true);
  const [formDraft, setFormDraft] = useState<TForm | undefined>(undefined);
  const [jsonDraft, setJsonDraft] = useState<string>('{}');
  const [saveError, setSaveError] = useState<Error | null>(null);

  // Track the original internal data for dirty comparison
  const originalInternalRef = useRef<TInternal | undefined>(undefined);

  // Track if we've initialized from server data
  const initializedRef = useRef(false);

  // ============================================
  // Derived State
  // ============================================
  const serverData = query.data?.value;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const isSaving = mutation.isPending;

  // Initialize drafts when server data arrives
  useEffect(() => {
    if (serverData && !initializedRef.current) {
      initializedRef.current = true;
      // Deep clone to avoid frozen object issues from React Query and Immer
      const clonedData = deepClone(serverData);
      const internal = transforms.apiToInternal(clonedData);
      originalInternalRef.current = deepClone(internal);
      setFormDraft(deepClone(transforms.internalToForm(internal)));
      setJsonDraft(transforms.internalToJson(internal));
    }
  }, [serverData, transforms]);

  // Also update when server data changes after save
  useEffect(() => {
    if (serverData && initializedRef.current && readOnly) {
      // Deep clone to avoid frozen object issues from React Query and Immer
      const clonedData = deepClone(serverData);
      const internal = transforms.apiToInternal(clonedData);
      originalInternalRef.current = deepClone(internal);
      setFormDraft(deepClone(transforms.internalToForm(internal)));
      setJsonDraft(transforms.internalToJson(internal));
    }
  }, [serverData, transforms, readOnly]);

  // ============================================
  // Dirty State Calculation
  // ============================================
  const isFormDirty = useMemo(() => {
    if (!formDraft || !originalInternalRef.current) return false;
    try {
      const currentInternal = transforms.formToInternal(formDraft);
      const originalJson = transforms.internalToJson(originalInternalRef.current);
      const currentJson = transforms.internalToJson(currentInternal);
      return originalJson !== currentJson;
    } catch {
      return true; // Assume dirty if transformation fails
    }
  }, [formDraft, transforms]);

  const isJsonDirty = useMemo(() => {
    if (!originalInternalRef.current) return false;
    try {
      const originalJson = transforms.internalToJson(originalInternalRef.current);
      // Normalize JSON for comparison (remove whitespace differences)
      const normalizedOriginal = JSON.stringify(JSON.parse(originalJson));
      const normalizedCurrent = JSON.stringify(JSON.parse(jsonDraft));
      return normalizedOriginal !== normalizedCurrent;
    } catch {
      return true; // Assume dirty if parse fails
    }
  }, [jsonDraft, transforms]);

  const isDirty = activeView === 'form' ? isFormDirty : isJsonDirty;

  // ============================================
  // Actions
  // ============================================
  const syncFormToJson = useCallback(() => {
    if (!formDraft) return;
    try {
      const internal = transforms.formToInternal(formDraft);
      setJsonDraft(transforms.internalToJson(internal));
    } catch {
      // Keep existing JSON if transformation fails
    }
  }, [formDraft, transforms]);

  const syncJsonToForm = useCallback(() => {
    try {
      const internal = transforms.jsonToInternal(jsonDraft);
      // Deep clone to avoid frozen object issues from Immer
      setFormDraft(deepClone(transforms.internalToForm(internal)));
    } catch {
      // Keep existing form if transformation fails
    }
  }, [jsonDraft, transforms]);

  const setActiveView = useCallback(
    (view: ViewMode) => {
      if (view === activeView) return;

      // Sync data before switching views
      if (activeView === 'form' && view === 'json') {
        syncFormToJson();
      } else if (activeView === 'json' && view === 'form') {
        syncJsonToForm();
      }

      setActiveViewState(view);
    },
    [activeView, syncFormToJson, syncJsonToForm]
  );

  const updateFormDraft = useCallback((data: TForm) => {
    setFormDraft(data);
  }, []);

  const updateJsonDraft = useCallback((json: string) => {
    setJsonDraft(json);
  }, []);

  const resetDrafts = useCallback(() => {
    if (!originalInternalRef.current) return;
    // Deep clone to avoid frozen object issues from Immer
    setFormDraft(deepClone(transforms.internalToForm(originalInternalRef.current)));
    setJsonDraft(transforms.internalToJson(originalInternalRef.current));
  }, [transforms]);

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const save = useCallback(async (): Promise<boolean> => {
    setSaveError(null);

    try {
      let apiData: TApi;

      if (activeView === 'form') {
        if (!formDraft) return false;
        const internal = transforms.formToInternal(formDraft);
        apiData = transforms.internalToApi(internal);
      } else {
        const internal = transforms.jsonToInternal(jsonDraft);
        apiData = transforms.internalToApi(internal);
      }

      await mutation.mutateAsync(apiData);

      // Update original reference after successful save
      const internal =
        activeView === 'form'
          ? transforms.formToInternal(formDraft!)
          : transforms.jsonToInternal(jsonDraft);
      originalInternalRef.current = internal;

      // Refetch to get updated data
      await query.refetch();

      // Switch back to read-only mode
      setReadOnly(true);

      onSaveSuccess?.();

      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error('Save failed'));
      return false;
    }
  }, [
    activeView,
    formDraft,
    jsonDraft,
    mutation,
    query,
    transforms,
    onSaveSuccess,
  ]);

  return {
    // Server state
    serverData,
    isLoading,
    isError,
    refetch,

    // Draft state
    formDraft,
    jsonDraft,

    // Dirty tracking
    isFormDirty,
    isJsonDirty,
    isDirty,

    // View mode
    activeView,
    readOnly,

    // Actions
    setActiveView,
    setReadOnly,
    updateFormDraft,
    updateJsonDraft,
    syncFormToJson,
    syncJsonToForm,
    resetDrafts,
    save,

    // Mutation state
    isSaving,
    saveError,
  };
}
