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

import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartSSL } from '@/components/form-slice/FormPartSSL';
import {
  SSLPostSchema,
  type SSLPostType,
} from '@/components/form-slice/FormPartSSL/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { API_SSLS } from '@/config/constant';
import { req } from '@/config/req';
import { type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const SSLAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const postSSL = useMutation({
    mutationFn: (data: SSLPostType) =>
      req.post<unknown, APISIXType['RespSSLDetail']>(API_SSLS, data),
    async onSuccess() {
      notifications.show({
        message: t('ssls.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/ssls',
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(SSLPostSchema),
    shouldUnregister: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          postSSL.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartSSL />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('ssls.add.title')} />
      <FormTOCBox>
        <SSLAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/ssls/add')({
  component: RouteComponent,
});
