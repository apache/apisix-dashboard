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
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Drawer, Group, ScrollArea, Skeleton, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ZodSchema } from 'zod';

export type FormEditDrawerProps<TForm, TApi> = {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** Query options to fetch the resource data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryOptions: UseQueryOptions<any, any, any, any>;
  /** Zod schema for form validation */
  schema: ZodSchema<TForm>;
  /** Transform API response to form values */
  toFormValues: (data: Record<string, unknown>) => TForm;
  /** Transform form values to API request */
  toApiData: (formData: TForm) => TApi;
  /** Function to save the data */
  onSave: (data: TApi) => Promise<unknown>;
  /** Callback after successful save */
  onSuccess?: () => void;
  /** Form content to render */
  children: ReactNode;
};

export const FormEditDrawer = <TForm extends object, TApi>(
  props: FormEditDrawerProps<TForm, TApi>
) => {
  const {
    opened,
    onClose,
    title,
    queryOptions,
    schema,
    toFormValues,
    toApiData,
    onSave,
    onSuccess,
    children,
  } = props;
  const { t } = useTranslation();

  const { data, isLoading, refetch } = useQuery({
    ...queryOptions,
    enabled: opened,
  });

  const form = useForm<TForm>({
    resolver: zodResolver(schema),
    mode: 'all',
  });

  // Update form when data loads
  useEffect(() => {
    if (data?.value && !isLoading) {
      const formValues = toFormValues(data.value);
      form.reset(formValues);
    }
  }, [data, isLoading, form, toFormValues]);

  const mutation = useMutation({
    mutationFn: async (formData: TForm) => {
      const apiData = toApiData(formData);
      return onSave(apiData);
    },
    onSuccess: async () => {
      notifications.show({
        message: t('info.edit.success', { name: title }),
        color: 'green',
      });
      await refetch();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      notifications.show({
        message: error instanceof Error ? error.message : t('form.view.transformError'),
        color: 'red',
      });
    },
  });

  const handleSubmit = form.handleSubmit((formData) => {
    mutation.mutate(formData);
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={`${t('form.view.editWithForm')}: ${title}`}
      position="right"
      size="xl"
      padding="md"
    >
      {isLoading ? (
        <Skeleton height={500} />
      ) : (
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} style={{ height: '100%' }}>
            <Stack gap="md" h="calc(100vh - 120px)">
              <ScrollArea flex={1} offsetScrollbars>
                {children}
              </ScrollArea>

              <Group justify="flex-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={mutation.isPending}
                >
                  {t('form.btn.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  loading={mutation.isPending}
                >
                  {t('form.btn.save')}
                </Button>
              </Group>
            </Stack>
          </form>
        </FormProvider>
      )}
    </Drawer>
  );
};
