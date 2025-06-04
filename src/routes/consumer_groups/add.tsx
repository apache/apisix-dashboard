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
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putConsumerGroupReq } from '@/apis/consumer_groups';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import PageHeader from '@/components/page/PageHeader';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const ConsumerGroupAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putConsumerGroup = useMutation({
    mutationFn: (d: APISIXType['ConsumerGroupPut']) =>
      putConsumerGroupReq(req, d),
    async onSuccess(response) {
      notifications.show({
        message: t('info.add.success', { name: t('consumerGroups.singular') }),
        color: 'green',
      });
      await router.navigate({
        to: '/consumer_groups/detail/$id',
        params: { id: response.data.value.id },
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerGroupPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues: {
      id: nanoid(),
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putConsumerGroup.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormSectionGeneral />
        <FormPartPluginConfig basicProps={{ showName: false }} />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t('info.add.title', { name: t('consumerGroups.singular') })}
      />
      <FormTOCBox>
        <ConsumerGroupAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/consumer_groups/add')({
  component: RouteComponent,
});
