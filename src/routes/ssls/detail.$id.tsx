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

import { getSSLQueryOptions } from '@/apis/hooks';
import { putSSLReq } from '@/apis/ssls';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartSSL } from '@/components/form-slice/FormPartSSL';
import {
  produceToSSLForm,
  SSLPutSchema,
  type SSLPutType,
} from '@/components/form-slice/FormPartSSL/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { API_SSLS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';
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
  const { getValues } = useFormContext<SSLPutType>();
  const [previewJson, setPreviewJson] = useState('{}');

  const handlePreview = () => {
    const formData = getValues();
    const apiData = pipeProduce()(formData);
    setPreviewJson(JSON.stringify(apiData, null, 2));
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
const SSLDetailForm = (props: Props) => {
  const { setEditMode, id, onDeleteSuccess } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: { value: sslData },
    isLoading,
    refetch,
  } = useSuspenseQuery(getSSLQueryOptions(id));

  const form = useForm({
    resolver: zodResolver(SSLPutSchema),
    shouldUnregister: true,
    mode: 'all',
  });

  useEffect(() => {
    if (sslData && !isLoading) {
      form.reset(produceToSSLForm(sslData));
    }
  }, [sslData, form, isLoading]);

  const putSSL = useMutation({
    mutationFn: (d: SSLPutType) => putSSLReq(req, pipeProduce()(d)),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('ssls.singular') }),
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
        title={t('info.edit.title', { name: t('ssls.singular') })}
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
              name={t('ssls.singular')}
              target={id}
              api={`${API_SSLS}/${id}`}
              onSuccess={onDeleteSuccess}
            />
          </Group>
        }
      />
      <FormTOCBox>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit((d) => putSSL.mutateAsync(d))}>
            <FormSectionGeneral readOnly />
            <FormPartSSL />
            <Group>
              <FormSubmitBtn loading={putSSL.isPending}>
                {t('form.btn.save')}
              </FormSubmitBtn>
              <PreviewJSONButton />
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/ssls' })}
                disabled={putSSL.isPending}
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
const SSLDetailJSON = (props: Props) => {
  const { setEditMode, id, onDeleteSuccess } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: { value: sslData },
    isLoading,
    refetch,
  } = useSuspenseQuery(getSSLQueryOptions(id));

  const [jsonValue, setJsonValue] = useState<string>('{}');

  useEffect(() => {
    if (sslData && !isLoading) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct, update_time: _ut, ...displayData } = sslData;
      setJsonValue(JSON.stringify(displayData, null, 2));
    }
  }, [sslData, isLoading]);

  const putSSL = useMutation({
    mutationFn: (d: APISIXType['SSL']) => putSSLReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('ssls.singular') }),
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
      await putSSL.mutateAsync(dataToSave);
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
    navigate({ to: '/ssls' });
  };

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <PageHeader
        title={`${t('info.edit.title', { name: t('ssls.singular') })} (JSON)`}
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
              name={t('ssls.singular')}
              target={id}
              api={`${API_SSLS}/${id}`}
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
        isSaving={putSSL.isPending}
      />
    </>
  );
};

type SSLDetailProps = {
  id: string;
  onDeleteSuccess: () => void;
  initialMode: EditMode;
};

export const SSLDetail = (props: SSLDetailProps) => {
  const { id, onDeleteSuccess, initialMode } = props;
  const [editMode, setEditMode] = useState<EditMode>(initialMode);

  useEffect(() => {
    setEditMode(initialMode);
  }, [initialMode]);

  const isFormMode = editMode === 'form';

  return isFormMode ? (
    <SSLDetailForm
      id={id}
      setEditMode={setEditMode}
      onDeleteSuccess={onDeleteSuccess}
    />
  ) : (
    <SSLDetailJSON
      id={id}
      setEditMode={setEditMode}
      onDeleteSuccess={onDeleteSuccess}
    />
  );
};

function RouteComponent() {
  const { id } = useParams({ from: '/ssls/detail/$id' });
  const { mode } = useSearch({ from: '/ssls/detail/$id' });
  const navigate = useNavigate();

  const initialMode: EditMode = mode === 'json' ? 'json' : 'form';

  return (
    <SSLDetail
      id={id}
      initialMode={initialMode}
      onDeleteSuccess={() => navigate({ to: '/ssls' })}
    />
  );
}

export const Route = createFileRoute('/ssls/detail/$id')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
