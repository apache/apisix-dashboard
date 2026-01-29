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
import { Button, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { putGlobalRuleReq } from '@/apis/global_rules';
import { getGlobalRuleQueryOptions } from '@/apis/hooks';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { API_GLOBAL_RULES } from '@/config/constant';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import IconCode from '~icons/material-symbols/code';
import IconForm from '~icons/material-symbols/list-alt';

// Search params schema for mode selection
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

type EditMode = 'form' | 'json';

type Props = {
  setEditMode: (mode: EditMode) => void;
  id: string;
  onDeleteSuccess: () => void;
};

// Preview JSON button for Form mode
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

/**
 * Form Edit Component - Always editable
 */
const GlobalRuleDetailForm = (props: Props) => {
  const { setEditMode, id, onDeleteSuccess } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const detailReq = useSuspenseQuery(getGlobalRuleQueryOptions(id));
  const { data, isLoading, refetch } = detailReq;

  const form = useForm({
    resolver: zodResolver(APISIX.GlobalRulePut),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {},
    mode: 'onChange',
  });

  useEffect(() => {
    if (data?.value && !isLoading) {
      form.reset(data.value);
    }
  }, [data, form, isLoading]);

  const putGlobalRule = useMutation({
    mutationFn: (d: APISIXType['GlobalRulePut']) => putGlobalRuleReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('globalRules.singular') }),
        color: 'green',
      });
      await refetch();
    },
  });

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <PageHeader
        title={t('info.edit.title', { name: t('globalRules.singular') })}
        extra={
          <Group>
            <Button
              size="compact-sm"
              variant="light"
              leftSection={<IconCode />}
              onClick={() => setEditMode('json')}
            >
              {t('form.view.editWithJSON')}
            </Button>
            <DeleteResourceBtn
              mode="detail"
              name={t('globalRules.singular')}
              target={id}
              api={`${API_GLOBAL_RULES}/${id}`}
              onSuccess={onDeleteSuccess}
            />
          </Group>
        }
      />
      <FormTOCBox>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit((d) => putGlobalRule.mutateAsync(d))}>
            <FormSectionGeneral readOnly />
            <FormPartGlobalRules />
            <Group>
              <FormSubmitBtn loading={putGlobalRule.isPending}>
                {t('form.btn.save')}
              </FormSubmitBtn>
              <PreviewJSONButton />
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/global_rules' })}
                disabled={putGlobalRule.isPending}
              >
                {t('form.btn.cancel')}
              </Button>
            </Group>
          </form>
        </FormProvider>
      </FormTOCBox>
    </>
  );
};

/**
 * JSON Edit Component - Always editable
 */
const GlobalRuleDetailJSON = (props: Props) => {
  const { setEditMode, id, onDeleteSuccess } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const detailReq = useSuspenseQuery(getGlobalRuleQueryOptions(id));
  const { data, isLoading, refetch } = detailReq;

  const [jsonValue, setJsonValue] = useState<string>('{}');

  useEffect(() => {
    if (data?.value && !isLoading) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct, update_time: _ut, ...displayData } = data.value;
      setJsonValue(JSON.stringify(displayData, null, 2));
    }
  }, [data, isLoading]);

  const putGlobalRule = useMutation({
    mutationFn: (d: APISIXType['GlobalRulePut']) => putGlobalRuleReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('globalRules.singular') }),
        color: 'green',
      });
      await refetch();
    },
    onError(error) {
      notifications.show({
        message: error.message || t('form.view.transformError'),
        color: 'red',
      });
    },
  });

  const handleSave = async (): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonValue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct2, update_time: _ut2, ...dataToSave } = parsed;
      await putGlobalRule.mutateAsync(dataToSave);
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

  const handleCancel = () => {
    navigate({ to: '/global_rules' });
  };

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <PageHeader
        title={`${t('info.edit.title', { name: t('globalRules.singular') })} (JSON)`}
        extra={
          <Group>
            <Button
              size="compact-sm"
              variant="light"
              leftSection={<IconForm />}
              onClick={() => setEditMode('form')}
            >
              {t('form.view.editWithForm')}
            </Button>
            <DeleteResourceBtn
              mode="detail"
              name={t('globalRules.singular')}
              target={id}
              api={`${API_GLOBAL_RULES}/${id}`}
              onSuccess={onDeleteSuccess}
            />
          </Group>
        }
      />
      <JSONEditorView
        value={jsonValue}
        readOnly={false}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={setJsonValue}
        isSaving={putGlobalRule.isPending}
      />
    </>
  );
};

type GlobalRuleDetailProps = {
  id: string;
  onDeleteSuccess: () => void;
  initialMode: EditMode;
};

export const GlobalRuleDetail = (props: GlobalRuleDetailProps) => {
  const { id, onDeleteSuccess, initialMode } = props;
  const [editMode, setEditMode] = useState<EditMode>(initialMode);

  useEffect(() => {
    setEditMode(initialMode);
  }, [initialMode]);

  const isFormMode = editMode === 'form';

  return isFormMode ? (
    <GlobalRuleDetailForm
      id={id}
      setEditMode={setEditMode}
      onDeleteSuccess={onDeleteSuccess}
    />
  ) : (
    <GlobalRuleDetailJSON
      id={id}
      setEditMode={setEditMode}
      onDeleteSuccess={onDeleteSuccess}
    />
  );
};

function RouteComponent() {
  const { id } = useParams({ from: '/global_rules/detail/$id' });
  const { mode } = useSearch({ from: '/global_rules/detail/$id' });
  const navigate = useNavigate();

  const initialMode: EditMode = mode === 'json' ? 'json' : 'form';

  return (
    <GlobalRuleDetail
      id={id}
      initialMode={initialMode}
      onDeleteSuccess={() => navigate({ to: '/global_rules' })}
    />
  );
}

export const Route = createFileRoute('/global_rules/detail/$id')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
