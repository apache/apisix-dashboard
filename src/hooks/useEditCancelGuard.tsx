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
import { useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { confirmDiscardChanges } from '@/hooks/useUnsavedChangesGuard';
import { isFormDirty } from '@/utils/form-dirty';

/**
 * Guard the Edit-mode → Cancel handler so a misclick cannot throw away
 * in-flight changes — but only when there are changes to throw away.
 *
 * This hook used to open the modal unconditionally, on the theory that
 * `isDirty` could not be trusted under the `disabled`-toggling edit
 * architecture: that toggling `disabled` fires spurious change events, and
 * that the reset-on-refetch effect wipes dirtiness mid-session. Neither
 * reproduces. Entering edit mode leaves the form clean on all twelve
 * detail pages, and an ordinary refetch returns the same `data` reference
 * (react-query structural sharing), so the reset effect never re-runs.
 *
 * `isFormDirty` rather than react-hook-form's `isDirty` because the raw
 * flag reports pristine add pages as dirty; the two hooks share one
 * definition of "changed".
 */
export const useEditCancelGuard = <T extends FieldValues>(
  form: UseFormReturn<T>,
  onCancel: () => void
) => {
  const { t } = useTranslation();
  return useCallback(async () => {
    const discard = () => {
      form.reset();
      onCancel();
    };
    if (!isFormDirty(form.formState.defaultValues, form.getValues())) {
      discard();
      return;
    }
    if (await confirmDiscardChanges(t)) discard();
  }, [form, onCancel, t]);
};
