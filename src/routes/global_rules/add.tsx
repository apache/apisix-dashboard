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
import { Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { putGlobalRuleReq } from '@/apis/global_rules';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { APISIX } from '@/types/schema/apisix';
import IconCode from '~icons/material-symbols/code';

// Search params schema
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

// Global Rule creation template
const GLOBAL_RULE_TEMPLATE = {
  plugins: {},
};

type Props = {
  navigate: (res: APISIXType['RespGlobalRuleDetail']) => Promise<void>;
};

// Preview JSON button component (needs form context)
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<APISIXType['GlobalRulePut']>();
  const [previewJson, setPreviewJson] = useState('{}');

  const handlePreview = () => {
    const formData = getValues();
    setPreviewJson(JSON.stringify(formData, null, 2));
    open();
  };

  return (
    <>
      <Button variant="light" leftSection={<IconCode />} onClick={handlePreview}>
        {t('form.view.previewJSON')}
      </Button>
      <PreviewJSONModal opened={opened} onClose={close} json={previewJson} />
    </>
  );
};

const GlobalRuleAddForm = (props: Props) => {
  const { navigate } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const putGlobalRule = useMutation({
    mutationFn: (d: APISIXType['GlobalRulePut']) => putGlobalRuleReq(req, d),
    async onSuccess(res) {
      notifications.show({
        id: 'add-global_rule',
        message: t('info.add.success', { name: t('globalRules.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
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

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => putGlobalRule.mutateAsync(d))}>
        <FormSectionGeneral />
        <FormPartGlobalRules />
        <Group mt="xl" justify="space-between">
          <PreviewJSONButton />
          <Group>
            <Button variant="outline" onClick={() => router.history.back()}>
              {t('form.btn.cancel')}
            </Button>
            <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
          </Group>
        </Group>
      </form>
    </FormProvider>
  );
};

const GlobalRuleAddJSON = (props: Props) => {
  const { navigate } = props;
  const { t } = useTranslation();
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(GLOBAL_RULE_TEMPLATE, null, 2)
  );

  const putGlobalRule = useMutation({
    mutationFn: (d: APISIXType['GlobalRulePut']) => putGlobalRuleReq(req, d),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('globalRules.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
    onError(error) {
      notifications.show({
        message:
          error instanceof Error ? error.message : t('form.view.jsonParseError'),
        color: 'red',
      });
    },
  });

  const handleSave = async (): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonValue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct, update_time: _ut, ...dataToCreate } = parsed;
      // Auto-generate id if not provided
      const dataWithId = { ...dataToCreate, id: dataToCreate.id || nanoid() };
      await putGlobalRule.mutateAsync(dataWithId);
      return true;
    } catch (error) {
      notifications.show({
        message:
          error instanceof Error ? error.message : t('form.view.jsonParseError'),
        color: 'red',
      });
      return false;
    }
  };

  return (
    <JSONEditorView
      value={jsonValue}
      readOnly={false}
      onSave={handleSave}
      onChange={setJsonValue}
      isSaving={putGlobalRule.isPending}
    />
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useSearch({ from: '/global_rules/add' });

  const navigateToDetail = (res: APISIXType['RespGlobalRuleDetail']) =>
    navigate({
      to: '/global_rules/detail/$id',
      params: { id: res.data.value.id },
    });

  const isJsonMode = mode === 'json';
  const title = isJsonMode
    ? `${t('info.add.title', { name: t('globalRules.singular') })} (JSON)`
    : t('info.add.title', { name: t('globalRules.singular') });

  return (
    <>
      <PageHeader title={title} />
      {isJsonMode ? (
        <GlobalRuleAddJSON navigate={navigateToDetail} />
      ) : (
        <FormTOCBox>
          <GlobalRuleAddForm navigate={navigateToDetail} />
        </FormTOCBox>
      )}
    </>
  );
}

export const Route = createFileRoute('/global_rules/add')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
