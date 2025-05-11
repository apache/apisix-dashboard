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
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putConsumerReq } from '@/apis/consumers';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartConsumer } from '@/components/form-slice/FormPartConsumer';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const ConsumerAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putConsumer = useMutation({
    mutationFn: putConsumerReq,
    async onSuccess(_, res) {
      notifications.show({
        message: t('info.add.success', { name: t('consumers.singular') }),
        color: 'green',
      });
      await router.navigate({
        to: '/consumers/detail/$username',
        params: { username: res.username },
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putConsumer.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartConsumer />
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
        title={t('info.add.title', { name: t('consumers.singular') })}
      />
      <FormTOCBox>
        <ConsumerAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/consumers/add')({
  component: RouteComponent,
});
