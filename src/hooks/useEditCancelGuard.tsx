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
 * Why the modal always shows (even on a clean form):
 *
 * Every Edit page in this app uses the pattern
 *
 *   useForm({ disabled: readOnly, defaultValues: ... })
 *   useEffect(() => form.reset(producedValues), [data, form])
 *
 * which has two failure modes for any "is the form actually dirty?" check:
 *
 *   1. Toggling `disabled` from true→false on Edit re-renders every
 *      controlled input and can fire spurious change events that flip
 *      react-hook-form's `isDirty` to true with no user input.
 *   2. The `form.reset(...)` inside a useEffect runs whenever the backing
 *      query refetches (tab focus, window focus, mutation success), which
 *      wipes `isDirty` back to false mid-session — so a legitimately
 *      edited form can transiently appear clean.
 *
 * Both make `isDirty` unreliable as a "skip the modal" signal. Until the
 * underlying form lifecycle is restructured (tracked as a follow-up
 * cleanup), we always show the modal. One extra click is a far better
 * failure mode than silently losing an edit.
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
