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

import { putSecretReq } from '@/apis/secrets';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartSecret } from '@/components/form-slice/FormPartSecret';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import PageHeader from '@/components/page/PageHeader';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const SecretAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putSecret = useMutation({
    mutationFn: putSecretReq,
    async onSuccess() {
      notifications.show({
        message: t('info.add.success', { name: t('secrets.singular') }),
        color: 'green',
      });
      await router.navigate({
        to: '/secrets',
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.Secret),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {
      id: nanoid(),
      manager: APISIX.Secret.options[0].shape.manager.value,
    },
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putSecret.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormSectionGeneral showDate={false} />
        <FormPartSecret />
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
        title={t('info.add.title', { name: t('secrets.singular') })}
      />
      <FormTOCBox>
        <SecretAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/secrets/add')({
  component: RouteComponent,
});
