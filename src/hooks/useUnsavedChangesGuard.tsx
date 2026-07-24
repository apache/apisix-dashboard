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
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useBlocker } from '@tanstack/react-router';
import { useCallback, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isFormDirty } from '@/utils/form-dirty';

type Translate = ReturnType<typeof useTranslation>['t'];

/**
 * Ask the user whether to throw away unsaved edits.
 *
 * Resolves true when they confirm. Escape and outside-clicks resolve
 * false via onClose; Promise.resolve is idempotent, so the onConfirm path
 * still wins when both fire.
 */
export const confirmDiscardChanges = (t: Translate) =>
  new Promise<boolean>((resolve) => {
    modals.openConfirmModal({
      centered: true,
      title: t('info.unsaved.title'),
      children: <Text size="sm">{t('info.unsaved.content')}</Text>,
      labels: {
        confirm: t('info.unsaved.confirm'),
        cancel: t('form.btn.cancel'),
      },
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      onClose: () => resolve(false),
    });
  });

type UseUnsavedChangesGuardOptions = {
  /** Skip the guard entirely — e.g. a detail page in read-only mode. */
  disabled?: boolean;
};

/**
 * Block router navigations and tab close/reload while the form holds
 * unsaved work.
 *
 * Dirtiness comes from `isFormDirty`, not react-hook-form's `isDirty`:
 * the raw flag reports 5 of 11 add pages as dirty before the user types
 * anything, because their widgets normalize `undefined` to empty values
 * on mount.
 *
 * The returned `bypass()` must be called before a navigation the form
 * itself initiates after a successful submit — at that point the form is
 * still dirty relative to its defaults, so the guard would otherwise
 * block the page's own success redirect.
 */
export const useUnsavedChangesGuard = <T extends FieldValues>(
  form: UseFormReturn<T>,
  options: UseUnsavedChangesGuardOptions = {}
) => {
  const { t } = useTranslation();
  const bypassRef = useRef(false);

  const hasUnsavedChanges = useCallback(() => {
    if (bypassRef.current) return false;
    return isFormDirty(form.formState.defaultValues, form.getValues());
  }, [form]);

  // Stable identity so useBlocker (which keys its effect on shouldBlockFn)
  // subscribes once rather than re-subscribing every render — which would
  // also re-run isFormDirty's structuredClone on each render.
  const shouldBlockFn = useCallback(async () => {
    if (!hasUnsavedChanges()) return false;
    return !(await confirmDiscardChanges(t));
  }, [hasUnsavedChanges, t]);

  useBlocker({
    disabled: options.disabled,
    enableBeforeUnload: hasUnsavedChanges,
    shouldBlockFn,
  });

  const bypass = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { bypass };
};
