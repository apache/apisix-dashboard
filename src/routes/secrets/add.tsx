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

import { putSecretReq } from '@/apis/secrets';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartSecret } from '@/components/form-slice/FormPartSecret';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';
import IconCode from '~icons/material-symbols/code';

// Search params schema
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

// Secret creation template
const SECRET_TEMPLATE = {
  manager: 'vault',
  uri: 'http://127.0.0.1:8200',
  prefix: '/kv/apisix',
  token: '',
};

type Props = {
  onSuccess: () => Promise<void>;
};

// Preview JSON button component (needs form context)
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<APISIXType['Secret']>();
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

const SecretAddForm = (props: Props) => {
  const { onSuccess } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const putSecret = useMutation({
    mutationFn: (d: APISIXType['Secret']) =>
      putSecretReq(req, pipeProduce()(d)),
    async onSuccess() {
      notifications.show({
        message: t('info.add.success', { name: t('secrets.singular') }),
        color: 'green',
      });
      await queryClient.invalidateQueries({ queryKey: ['secrets'] });
      await onSuccess();
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
      <form onSubmit={form.handleSubmit((d) => putSecret.mutateAsync(d))}>
        <FormSectionGeneral />
        <FormPartSecret />
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

const SecretAddJSON = (props: Props) => {
  const { onSuccess } = props;
  const { t } = useTranslation();
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(SECRET_TEMPLATE, null, 2)
  );

  const putSecret = useMutation({
    mutationFn: (d: APISIXType['Secret']) => putSecretReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.add.success', { name: t('secrets.singular') }),
        color: 'green',
      });
      await queryClient.invalidateQueries({ queryKey: ['secrets'] });
      await onSuccess();
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
      await putSecret.mutateAsync(dataWithId);
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
      isSaving={putSecret.isPending}
    />
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useSearch({ from: '/secrets/add' });

  const handleSuccess = () => navigate({ to: '/secrets' });

  const isJsonMode = mode === 'json';
  const title = isJsonMode
    ? `${t('info.add.title', { name: t('secrets.singular') })} (JSON)`
    : t('info.add.title', { name: t('secrets.singular') });

  return (
    <>
      <PageHeader title={title} />
      {isJsonMode ? (
        <SecretAddJSON onSuccess={handleSuccess} />
      ) : (
        <FormTOCBox>
          <SecretAddForm onSuccess={handleSuccess} />
        </FormTOCBox>
      )}
    </>
  );
}

export const Route = createFileRoute('/secrets/add')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
