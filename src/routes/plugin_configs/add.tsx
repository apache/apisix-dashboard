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
import { Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putPluginConfigReq } from '@/apis/plugin_configs';
import { FormCancelBtn, FormSubmitBtn } from '@/components/form/Btn';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import PageHeader from '@/components/page/PageHeader';
import { req } from '@/config/req';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const PluginConfigAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(APISIX.PluginConfigPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues: {
      id: nanoid(),
    },
  });
  const { bypass } = useUnsavedChangesGuard(form);

  const putPluginConfig = useMutation({
    mutationFn: (d: APISIXType['PluginConfigPut']) =>
      putPluginConfigReq(req, d),
    async onSuccess(response) {
      notifications.show({
        message: t('info.add.success', { name: t('pluginConfigs.singular') }),
        color: 'green',
      });
      bypass();
      await router.navigate({
        to: '/plugin_configs/detail/$id',
        params: { id: response.data.value.id },
      });
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putPluginConfig.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormSectionGeneral />
        <FormPartPluginConfig />
        <Group>
          <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
          <FormCancelBtn to="/plugin_configs" />
        </Group>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t('info.add.title', { name: t('pluginConfigs.singular') })}
      />
      <FormTOCBox>
        <PluginConfigAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/plugin_configs/add')({
  component: RouteComponent,
});
