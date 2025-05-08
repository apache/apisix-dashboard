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
import {
  createFileRoute,
  useRouter as useReactRouter,
} from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putGlobalRuleReq } from '@/apis/plugins';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import type { APISIXType } from '@/types/schema/apisix';
import { APISIX } from '@/types/schema/apisix';

const GlobalRuleAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const putGlobalRule = useMutation({
    mutationFn: putGlobalRuleReq,
  });

  const form = useForm({
    resolver: zodResolver(APISIX.GlobalRulePut),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {
      plugins: {},
      id: nanoid(),
    },
    mode: 'onChange',
  });

  const submit = async (data: APISIXType['GlobalRulePut']) => {
    const res = await putGlobalRule.mutateAsync(data);
    notifications.show({
      id: 'add-global_rule',
      message: t('globalRules.add.success'),
      color: 'green',
    });
    await router.navigate({
      to: '/global_rules/detail/$id',
      params: { id: res.data.value.id },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartGlobalRules />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('globalRules.add.title')} />
      <FormTOCBox>
        <GlobalRuleAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/global_rules/add')({
  component: RouteComponent,
});
