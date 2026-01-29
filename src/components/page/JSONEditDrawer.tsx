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
import { Button, Drawer, Group, Skeleton, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemEditor } from '@/components/form/Editor';
import { validateJSONSyntax } from '@/utils/json-transformer';

export type JSONEditDrawerProps = {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** Query options to fetch the resource data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryOptions: UseQueryOptions<any, any, any, any>;
  /** Function to save the edited JSON */
  onSave: (data: Record<string, unknown>) => Promise<unknown>;
  /** Callback after successful save */
  onSuccess?: () => void;
};

export const JSONEditDrawer = (props: JSONEditDrawerProps) => {
  const { opened, onClose, title, queryOptions, onSave, onSuccess } = props;
  const { t } = useTranslation();

  const [jsonValue, setJsonValue] = useState('{}');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    ...queryOptions,
    enabled: opened,
  });

  const form = useForm<{ json: string }>({
    defaultValues: { json: '{}' },
  });

  const { setValue, watch } = form;
  const watchedJson = watch('json');

  // Update form when data loads
  useEffect(() => {
    if (data?.value && !isLoading) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct, update_time: _ut, ...displayData } = data.value;
      const formatted = JSON.stringify(displayData, null, 2);
      setJsonValue(formatted);
      setValue('json', formatted);
    }
  }, [data, isLoading, setValue]);

  // Sync watched value to local state
  useEffect(() => {
    setJsonValue(watchedJson);
  }, [watchedJson]);

  // Validate JSON on change
  useEffect(() => {
    const { isValid, error } = validateJSONSyntax(jsonValue);
    if (!isValid) {
      setValidationError(error || t('form.view.invalidJSON'));
    } else {
      setValidationError(null);
    }
  }, [jsonValue, t]);

  const handleSave = async () => {
    const { isValid } = validateJSONSyntax(jsonValue);
    if (!isValid) return;

    try {
      setIsSaving(true);
      const parsed = JSON.parse(jsonValue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct, update_time: _ut, ...dataToSave } = parsed;
      await onSave(dataToSave);
      notifications.show({
        message: t('info.edit.success', { name: title }),
        color: 'green',
      });
      await refetch();
      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        message: error instanceof Error ? error.message : t('form.view.jsonParseError'),
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setValidationError(null);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={`${t('form.view.editWithJSON')}: ${title}`}
      position="right"
      size="lg"
      padding="md"
    >
      {isLoading ? (
        <Skeleton height={500} />
      ) : (
        <FormProvider {...form}>
          <Stack gap="md">
            {validationError && (
              <Text c="red" size="sm">
                {validationError}
              </Text>
            )}

            <FormItemEditor
              name="json"
              h="calc(100vh - 200px)"
              language="json"
              required
            />

            <Group justify="flex-end">
              <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                {t('form.btn.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!!validationError || isSaving}
                loading={isSaving}
              >
                {t('form.btn.save')}
              </Button>
            </Group>
          </Stack>
        </FormProvider>
      )}
    </Drawer>
  );
};
