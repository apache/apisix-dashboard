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
import { useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/**
 * Guard the Edit-mode → Cancel handler with a confirmation modal so a
 * misclick can't silently throw away in-flight changes.
 *
 * Mirrors the same UX as the in-form PluginEditorDrawer guard added by
 * #3333. We always show the modal because every Edit page in the app
 * re-runs `form.reset(...)` whenever its useSuspenseQuery data is
 * referentially refreshed (e.g. on tab focus / refetch), which wipes
 * react-hook-form's `isDirty` flag and makes it unreliable as a "skip the
 * modal" signal. The extra click is a small price to pay for never losing
 * an edit.
 */
export const useEditCancelGuard = <T extends FieldValues>(
  form: UseFormReturn<T>,
  onCancel: () => void
) => {
  const { t } = useTranslation();
  return useCallback(() => {
    modals.openConfirmModal({
      centered: true,
      title: t('info.unsaved.title'),
      children: <Text size="sm">{t('info.unsaved.content')}</Text>,
      labels: {
        confirm: t('info.unsaved.confirm'),
        cancel: t('form.btn.cancel'),
      },
      onConfirm: () => {
        form.reset();
        onCancel();
      },
    });
  }, [form, onCancel, t]);
};
