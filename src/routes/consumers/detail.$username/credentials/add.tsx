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
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putCredentialReq } from '@/apis/credentials';
import { FormCancelBtn, FormSubmitBtn } from '@/components/form/Btn';
import { FormPartCredential } from '@/components/form-slice/FormPartCredential';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import PageHeader from '@/components/page/PageHeader';
import { req } from '@/config/req';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const CredentialAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { username } = useParams({
    from: '/consumers/detail/$username/credentials/add',
  });
  const [id] = useState(() => nanoid());

  const form = useForm({
    resolver: zodResolver(APISIX.CredentialPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues: {
      id,
    },
  });
  const { bypass } = useUnsavedChangesGuard(form);

  const putCredential = useMutation({
    mutationFn: (d: APISIXType['CredentialPut']) =>
      putCredentialReq(req, pipeProduce()({ ...d, username })),
    async onSuccess(_, res) {
      notifications.show({
        message: t('info.add.success', {
          name: t('credentials.singular'),
        }),
        color: 'green',
      });
      bypass();
      await router.navigate({
        to: '/consumers/detail/$username/credentials/detail/$id',
        params: { username, id: res.id },
      });
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => putCredential.mutateAsync(d))}>
        <FormSectionGeneral />
        <FormPartCredential />
        <Group>
          <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
          <FormCancelBtn
            to="/consumers/detail/$username/credentials"
            params={{ username }}
          />
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
        title={t('info.add.title', {
          name: t('credentials.singular'),
        })}
      />
      <FormTOCBox>
        <CredentialAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/add'
)({
  component: RouteComponent,
});
