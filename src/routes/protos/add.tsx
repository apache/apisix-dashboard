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
import {
  createFileRoute,
  useRouter as useReactRouter,
} from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { postProtoReq } from '@/apis/protos';
import { FormCancelBtn, FormSubmitBtn } from '@/components/form/Btn';
import { FormPartProto } from '@/components/form-slice/FormPartProto';
import PageHeader from '@/components/page/PageHeader';
import { req } from '@/config/req';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import type { APISIXType } from '@/types/schema/apisix';
import { APISIXProtos } from '@/types/schema/apisix/protos';

const defaultValues: APISIXType['ProtoPost'] = {
  content: '',
};

const ProtoAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const form = useForm({
    resolver: zodResolver(APISIXProtos.ProtoPost),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues,
    mode: 'onChange',
  });
  const { bypass } = useUnsavedChangesGuard(form);

  const postProto = useMutation({
    mutationFn: (d: APISIXType['ProtoPost']) => postProtoReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.add.success', { name: t('protos.singular') }),
        color: 'green',
      });
      bypass();
      await router.navigate({ to: '/protos' });
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => postProto.mutateAsync(d))}>
        <FormPartProto />
        <Group>
          <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
          <FormCancelBtn to="/protos" />
        </Group>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('info.add.title', { name: t('protos.singular') })} />
      <ProtoAddForm />
    </>
  );
}

export const Route = createFileRoute('/protos/add')({
  component: RouteComponent,
});
