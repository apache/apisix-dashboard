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

import { putConsumerReq } from '@/apis/consumers';
import { getConsumerQueryOptions } from '@/apis/hooks';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartConsumer } from '@/components/form-slice/FormPartConsumer';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { API_CONSUMERS } from '@/config/constant';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
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
  username: string;
  onDeleteSuccess: () => void;
};

// Preview JSON button for Form mode
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<APISIXType['ConsumerPut']>();
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
const ConsumerDetailForm = (props: Props) => {
  const { setEditMode, username, onDeleteSuccess } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const consumerQuery = useSuspenseQuery(getConsumerQueryOptions(username));
  const { data: consumerData, isLoading, refetch } = consumerQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
  });

  useEffect(() => {
    if (consumerData?.value && !isLoading) {
      form.reset(consumerData.value);
    }
  }, [consumerData, form, isLoading]);

  const putConsumer = useMutation({
    mutationFn: (d: APISIXType['ConsumerPut']) =>
      putConsumerReq(req, pipeProduce()(d)),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('consumers.singular') }),
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
        title={t('info.edit.title', { name: t('consumers.singular') })}
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
              name={t('consumers.singular')}
              target={username}
              api={`${API_CONSUMERS}/${username}`}
              onSuccess={onDeleteSuccess}
            />
          </Group>
        }
      />
      <FormTOCBox>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit((d) => putConsumer.mutateAsync(d))}>
            <FormSectionGeneral showID={false} readOnly />
            <FormPartConsumer />
            <Group mt="xl" justify="space-between">
              <PreviewJSONButton />
              <Group>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/consumers' })}
                  disabled={putConsumer.isPending}
                >
                  {t('form.btn.cancel')}
                </Button>
                <FormSubmitBtn loading={putConsumer.isPending}>
                  {t('form.btn.save')}
                </FormSubmitBtn>
              </Group>
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
const ConsumerDetailJSON = (props: Props) => {
  const { setEditMode, username, onDeleteSuccess } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const consumerQuery = useSuspenseQuery(getConsumerQueryOptions(username));
  const { data: consumerData, isLoading, refetch } = consumerQuery;

  const [jsonValue, setJsonValue] = useState<string>('{}');

  useEffect(() => {
    if (consumerData?.value && !isLoading) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { create_time: _ct, update_time: _ut, ...displayData } = consumerData.value;
      setJsonValue(JSON.stringify(displayData, null, 2));
    }
  }, [consumerData, isLoading]);

  const putConsumer = useMutation({
    mutationFn: (d: APISIXType['ConsumerPut']) => putConsumerReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('consumers.singular') }),
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
      await putConsumer.mutateAsync(dataToSave);
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
    navigate({ to: '/consumers' });
  };

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <>
      <PageHeader
        title={`${t('info.edit.title', { name: t('consumers.singular') })} (JSON)`}
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
              name={t('consumers.singular')}
              target={username}
              api={`${API_CONSUMERS}/${username}`}
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
        isSaving={putConsumer.isPending}
      />
    </>
  );
};

type ConsumerDetailProps = {
  username: string;
  onDeleteSuccess: () => void;
  initialMode: EditMode;
};

export const ConsumerDetail = (props: ConsumerDetailProps) => {
  const { username, onDeleteSuccess, initialMode } = props;
  const [editMode, setEditMode] = useState<EditMode>(initialMode);

  useEffect(() => {
    setEditMode(initialMode);
  }, [initialMode]);

  const isFormMode = editMode === 'form';

  return isFormMode ? (
    <ConsumerDetailForm
      username={username}
      setEditMode={setEditMode}
      onDeleteSuccess={onDeleteSuccess}
    />
  ) : (
    <ConsumerDetailJSON
      username={username}
      setEditMode={setEditMode}
      onDeleteSuccess={onDeleteSuccess}
    />
  );
};

function RouteComponent() {
  const { username } = useParams({ from: '/consumers/detail/$username' });
  const { mode } = useSearch({ from: '/consumers/detail/$username/' });
  const navigate = useNavigate();

  const initialMode: EditMode = mode === 'json' ? 'json' : 'form';

  return (
    <ConsumerDetail
      username={username}
      initialMode={initialMode}
      onDeleteSuccess={() => navigate({ to: '/consumers' })}
    />
  );
}

export const Route = createFileRoute('/consumers/detail/$username/')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
